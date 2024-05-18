import Data.List (sort)
import Data.Monoid (Product(getProduct), Sum(..))

foo :: Ord a => [a] -> [a]
foo xs =
  sort xs 

sum :: Sum a -> a
sum = getSum 

product :: Product a -> a
product = getProduct
