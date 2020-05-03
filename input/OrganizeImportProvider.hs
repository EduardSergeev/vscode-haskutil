{-# LANGUAGE NoImplicitPrelude #-}


module Main where

-- Some comment
import System.IO
import Data.Maybe (
    Maybe, 
    listToMaybe
  )
import Data.List
import qualified Data.ByteString.Lazy as M
import Prelude (Ord, ($), (.))
import Control.Monad


foo :: Ord a => [a] -> Maybe a
foo xs = 
  listToMaybe . sort $ xs

bar :: M.ByteString
bar = 
  M.empty

main :: IO ()
main =
  return ()
