
foo :: Ord a => [a] -> Maybe [a]
foo xs =
  listToMaybe . tails. sort $ xs 

bar :: (a -> b) -> (b -> c) -> (a -> c)
bar f g =
  f >>> g

escaped :: Int
escaped =
    foldl' (+) 0 [1..10]

dot :: Int
dot =
  42 .&. 1
