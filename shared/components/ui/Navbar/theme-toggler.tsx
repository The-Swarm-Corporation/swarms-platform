"use client";

// import Input from "antd/es/input/Input";
import classes from "./theme-toggler.module.css";
// import { ThemeContext, ToggleThemeContext } from "@/context/toggle-theme-provider";
//import { ToggleThemeContext } from "@/context/toggle-theme-provider";
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

function LightThemeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="lightToggleIcon_node_modules-@docusaurus-theme-classic-lib-theme-ColorModeToggle-styles-module"
        >
            <path
                fill="currentColor"
                d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1 s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0 c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95 c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41 L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06 c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"
            />
        </svg>
    );
}

function DarkThemeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="darkToggleIcon_node_modules-@docusaurus-theme-classic-lib-theme-ColorModeToggle-styles-module"
        >
            <path
                fill="white"
                d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"
            />
        </svg>
    );
}

export default function ThemeToggler() {
    // const toggleTheme = useContext(ToggleThemeContext);
    // const theme = useContext(ThemeContext);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return (
		 <button className={classes.button} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
			{theme === "light" ? <LightThemeIcon /> : <DarkThemeIcon />}
		</button>
    //     <button className={classes.button} onClick={toggleTheme}>
    //     {theme === "light" ? <LightThemeIcon /> : <DarkThemeIcon />}
    // </button>

        //<label className="inline-flex items-center cursor-pointer ml-4">
        //	<input type="checkbox" onChange={toggleTheme} className="sr-only peer" />
        //<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        //{/* <div className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Toggle me</div> */}
        //</label>

    );
}
