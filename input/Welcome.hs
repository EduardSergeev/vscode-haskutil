
foo :: Ord a => [a] -> Maybe [a]
foo xs =
  listToMaybe . tails. sort $ xs 
