
f0 :: (Num a, _) => a -> a
f0 x = x + x

f3 :: (Num a, _) => a -> Bool
f3 x = read (show $ x + x) == x

fe :: _ => a -> a
fe x = x
