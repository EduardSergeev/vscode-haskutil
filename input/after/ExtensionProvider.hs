{-# LANGUAGE DataKinds #-}

import Data.Kind (Type)

data Nat = Ze | Su Nat

data Vec :: Type -> Nat -> Type where
  Nil  :: Vec a Ze
  Cons :: a -> Vec a n -> Vec a (Su n)
