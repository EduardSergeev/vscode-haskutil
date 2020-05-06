{-# LANGUAGE TupleSections    #-}
{-# LANGUAGE TypeApplications #-}

foo :: String -> [(Int, Bool)]
foo xs =
  map (, True) . read @ [Int] $ xs
