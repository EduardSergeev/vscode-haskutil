
foo xs =
  map (, True) . read @ [Int] $ xs
