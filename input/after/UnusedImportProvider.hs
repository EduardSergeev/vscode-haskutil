import Data.List (sort)

foo :: Ord a => [a] -> [a]
foo xs =
  sort xs 
