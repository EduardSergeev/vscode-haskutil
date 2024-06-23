{-# LANGUAGE NoImplicitPrelude #-}


module Main where

-- Some comment
import           Control.Monad
import qualified Data.ByteString.Lazy as M
import           Data.List
import           Data.Maybe (
    Maybe,
    listToMaybe
  )
import           Prelude (($), (.),  Ord)
import           System.IO


foo :: Ord a => [a] -> Maybe a
foo xs = 
  listToMaybe . sort $ xs

bar :: M.ByteString
bar = 
  M.empty

main :: IO ()
main =
  return ()
