import Data.List (sort, tails)
import Data.Maybe

foo :: Ord a => [a] -> [a]
foo xs =
  sort xs 
