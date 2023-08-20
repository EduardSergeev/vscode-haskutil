import qualified Data.ByteString as BS
import           Data.Word
import qualified Numeric

foo xs =
  BS.pack xs

bar i =
  Numeric.showInt i
