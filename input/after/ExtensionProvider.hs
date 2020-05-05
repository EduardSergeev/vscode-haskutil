{-# LANGUAGE TupleSections    #-}
{-# LANGUAGE TypeApplications #-}

foo xs =
  map (, True) . read @ [Int] $ xs
