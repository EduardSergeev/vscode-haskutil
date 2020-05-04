
foo :: Ord a => [a] -> Maybe a
foo xs =
  listToMaybe . sort $ xs 
