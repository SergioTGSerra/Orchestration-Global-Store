import HomeIcon from "@mui/icons-material/Home";
import StarIcon from "@mui/icons-material/Star";
import ChecklistIcon from "@mui/icons-material/Checklist";
import {Flag, People, Person} from "@mui/icons-material";


const LINKS = [
    {text: 'Home', href: '/', icon: HomeIcon},
    {text: 'Segments', href: '/segments', icon: Person },
    {text: 'Markets', href: '/markets', icon: People},
    {text: 'Countries', href: '/countries', icon: Flag },
    {text: 'Customers', href: '/customers', icon: Flag },
    {text: 'Orders', href: '/orders', icon: Flag },
    {text: 'Priorities', href: '/priorities', icon: Flag },
    {text: 'Products', href: '/products', icon: Flag },
    {text: 'Ship Modes', href: '/ship-modes', icon: Flag },
    {text: 'States', href: '/states', icon: Flag },
];
export default LINKS;