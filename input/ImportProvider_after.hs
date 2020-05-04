import Data.List (sort)
import Data.Maybe

foo :: Ord a => [a] -> Maybe a
foo xs =
  listToMaybe . sort $ xs 
