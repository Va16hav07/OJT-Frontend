import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WishlistProvider } from './product';
import { ThemeProvider } from './contexts/ThemeContext';
import Homepage from './homepage';
import Product from './product';
import Checkout from './Checkout';
import ProductView from './Productveiw';
import Signup from './Signup';
import History from "./History";
import Payment from "./Payment";
import Profile from "./Profile";
import PutRent from "./PutRent";
import Wishlist from "./Wishlist";
import OrderVeiw from "./OrderVeiw";
import Login from "./login";
import Header from "./header";
import Footer from "./Footer";
import OrderConfirmation from "./OrderConfirmation";
import AdminPage from "./Admin";
import BannedUserMessage from "./BannedUserMessage";
import About from "./about";
import Contact from "./contact";
import HelpCenter from "./help center";
import FAQ from "./FAQ";
import Privacy from "./privacy";
import Terms from "./Terms";
import Cookies from "./cookies";
import OAuthCallback from './components/OAuthCallback';

function App() {
  return (
    <ThemeProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage/>}/>
            <Route path="/product" element={<Product/>}/>
            <Route path="/Checkout" element={<Checkout/>}/>
            <Route path="/productview/:productId" element={<ProductView/>}/>
            <Route path="/Signup" element={<Signup/>}/>
            <Route path="/History" element={<History/>}/>
            <Route path="/Payment" element={<Payment/>}/>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/PutRent" element={<PutRent/>}/>
            <Route path="/Wishlist" element={<Wishlist/>}/>
            <Route path="/OrderVeiw" element={<OrderVeiw/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/header" element={<Header/>}/>
            <Route path="/footer" element={<Footer/>}/>
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/banned" element={<BannedUserMessage />} /> 
            <Route path="/about" element={<About/>}/>
            <Route path="/contact" element={<Contact/>}/>
            <Route path="/help" element={<HelpCenter/>}/>
            <Route path="/faq" element={<FAQ/>}/>
            <Route path="/privacy" element={<Privacy/>}/>
            <Route path="/terms" element={<Terms/>}/>
            <Route path="/cookies" element={<Cookies/>}/>
            <Route path="/oauth-callback" element={<OAuthCallback />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </ThemeProvider>
  );
}

export default App;