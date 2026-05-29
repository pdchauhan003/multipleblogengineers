'use client'

import Navbar from "./Navbar"
import { useAuth } from "@/context/authContext"

function NavbarWrapp(){
    const {user}=useAuth();
    return <>{user && <Navbar/>}</>;
}
export default NavbarWrapp