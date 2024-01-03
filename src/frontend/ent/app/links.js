import HomeIcon from "@mui/icons-material/Home";
import StarIcon from "@mui/icons-material/Star";
import ChecklistIcon from "@mui/icons-material/Checklist";
import {Flag, People, ShoppingCart, Category, Public, Store, PriorityHigh, LocalShipping, Inventory, Segment} from "@mui/icons-material";


const LINKS = [
    {text: 'Home', href: '/', icon: HomeIcon},
    {text: 'Categories', href: '/categories', icon: Category },
    {text: 'Countries', href: '/countries', icon: Public },
    {text: 'Customers', href: '/customers', icon: People },
    {text: 'Markets', href: '/markets', icon: Store },
    {text: 'Orders', href: '/orders', icon: ShoppingCart },
    {text: 'Priorities', href: '/priorities', icon: PriorityHigh },
    {text: 'Products', href: '/products', icon: Inventory },
    {text: 'Segments', href: '/segments', icon: Segment },
    {text: 'Ship Modes', href: '/ship-modes', icon: LocalShipping },
    {text: 'States', href: '/states', icon: Flag },
];
export default LINKS;