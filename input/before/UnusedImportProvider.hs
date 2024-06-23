import Data.List (sort, tails)
import Data.Maybe
import Data.Monoid (All (..), Any(getAny), Product(getProduct), Sum(..), Any(..), First(..))

foo :: Ord a => [a] -> [a]
foo xs =
  sort xs 

sum :: Sum a -> a
sum = getSum 

product :: Product a -> a
product = getProduct
