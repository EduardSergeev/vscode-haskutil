
f0 :: (Num a) => a -> a
f0 x = x + x

f3 :: (Num a, Eq a, Read a, Show a) => a -> Bool
f3 x = read (show $ x + x) == x

fe :: a -> a
fe x = x
