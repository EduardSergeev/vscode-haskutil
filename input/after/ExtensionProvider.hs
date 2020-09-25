{-# LANGUAGE TupleSections #-}

foo :: [a] -> [(a, Bool)]
foo = map (, True)
