
f0 :: (Num a) => a -> a
-- Result: f0 :: (Num a, ()) => a -> a
-- Not idiomatic and needs -XConstraintKinds
-- Ideal: f0 :: (Num a) => a -> a or f0 :: Num a => a -> a
f0 x = x + x

f3 :: (Num a, Eq a, Read a, Show a) => a -> Bool
-- Result: f3 :: (Num a, (Eq a, Read a, Show a)) => a -> Bool
-- Needs -XConstraintKinds
-- Ideal: f3 :: (Num a, Eq a, Read a, Show a) => a -> Bool
f3 x = read (show $ x + x) == x

fe :: a -> a
-- Result: fe :: () => a -> a
-- Ideal: fe :: a -> a
fe x = x
