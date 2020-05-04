import Data.List (sort, tails)
import Data.Maybe

foo :: Ord a => [a] -> Maybe [a]
foo xs =
  listToMaybe . tails. sort $ xs 
