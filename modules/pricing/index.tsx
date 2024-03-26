import pricingData from '@/shared/data/pricing.json'
import { cn } from '@/shared/utils/cn';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const Pricing = () => {
    return (
        <section className="bg-background relative overflow-hidden">
            <svg className="absolute opacity-20" width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_17_23)">
                    <g filter="url(#filter0_f_17_23)">
                        <path d="M271.4 0H400V322.2L320 290L271.4 0Z" fill="#fff"></path>
                        <path d="M400 322.2V400H320H244L320 290L400 322.2Z" fill="#fff"></path>
                        <path d="M244 400H0V166L320 290L244 400Z" fill="#fff"></path>
                        <path d="M0 0H271.4L320 290L0 166V0Z" fill="#fff"></path>
                    </g>
                </g>
                <defs>
                    <filter id="filter0_f_17_23" x="-159.933" y="-159.933" width="719.867" height="719.867" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                        <feGaussianBlur stdDeviation="79.9667" result="effect1_foregroundBlur_17_23"></feGaussianBlur>
                    </filter>
                </defs>
            </svg>
            <svg className="absolute opacity-30" viewBox="0 0 960 637" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_f_1_167)">
                    <ellipse cx="479.5" cy="318.5" rx="118.5" ry="118.5" transform="rotate(-90 479.5 318.5)" fill="#3C459A" fill-opacity="0.5"></ellipse>
                </g>
                <mask id="mask0_1_167" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="32" width="960" height="573">
                    <rect y="32" width="960" height="573" fill="url(#paint0_radial_1_167)"></rect>
                </mask>
                <g mask="url(#mask0_1_167)">
                    <rect x="123.5" y="41.5" width="79" height="79" stroke="white"></rect>
                    <rect x="202.5" y="41.5" width="79" height="79" stroke="white"></rect>
                    <rect x="281.5" y="41.5" width="79" height="79" stroke="white"></rect>
                    <rect x="360.5" y="41.5" width="79" height="79" stroke="white"></rect>
                    <rect x="439.5" y="41.5" width="79" height="79" stroke="white"></rect>
                    <rect x="518.5" y="41.5" width="79" height="79" stroke="white"></rect>
                    <rect x="597.5" y="41.5" width="79" height="79" fill="white" fill-opacity="0.25" stroke="white"></rect>
                    <rect x="676.5" y="41.5" width="79" height="79" stroke="white"></rect>
                    <rect x="755.5" y="41.5" width="79" height="79" stroke="white"></rect>
                    <rect x="123.5" y="120.5" width="79" height="79" stroke="white"></rect>
                    <rect x="202.5" y="120.5" width="79" height="79" stroke="white"></rect>
                    <rect x="281.5" y="120.5" width="79" height="79" stroke="white"></rect>
                    <rect x="360.5" y="120.5" width="79" height="79" stroke="white"></rect>
                    <rect x="439.5" y="120.5" width="79" height="79" stroke="white"></rect>
                    <rect x="518.5" y="120.5" width="79" height="79" stroke="white"></rect>
                    <rect x="597.5" y="120.5" width="79" height="79" stroke="white"></rect>
                    <rect x="676.5" y="120.5" width="79" height="79" stroke="white"></rect>
                    <rect x="755.5" y="120.5" width="79" height="79" stroke="white"></rect>
                    <rect x="123.5" y="199.5" width="79" height="79" stroke="white"></rect>
                    <rect x="202.5" y="199.5" width="79" height="79" stroke="white"></rect>
                    <rect x="281.5" y="199.5" width="79" height="79" stroke="white"></rect>
                    <rect x="360.5" y="199.5" width="79" height="79" stroke="white"></rect>
                    <rect x="439.5" y="199.5" width="79" height="79" fill="white" fill-opacity="0.25" stroke="white"></rect>
                    <rect x="518.5" y="199.5" width="79" height="79" stroke="white"></rect>
                    <rect x="597.5" y="199.5" width="79" height="79" fill="white" fill-opacity="0.25" stroke="white"></rect>
                    <rect x="676.5" y="199.5" width="79" height="79" stroke="white"></rect>
                    <rect x="755.5" y="199.5" width="79" height="79" stroke="white"></rect>
                    <rect x="123.5" y="278.5" width="79" height="79" stroke="white"></rect>
                    <rect x="202.5" y="278.5" width="79" height="79" stroke="white"></rect>
                    <rect x="281.5" y="278.5" width="79" height="79" stroke="white"></rect>
                    <rect x="360.5" y="278.5" width="79" height="79" stroke="white"></rect>
                    <rect x="439.5" y="278.5" width="79" height="79" stroke="white"></rect>
                    <rect x="518.5" y="278.5" width="79" height="79" stroke="white"></rect>
                    <rect x="597.5" y="278.5" width="79" height="79" stroke="white"></rect>
                    <rect x="676.5" y="278.5" width="79" height="79" stroke="white"></rect>
                    <rect x="755.5" y="278.5" width="79" height="79" stroke="white"></rect>
                    <rect x="123.5" y="357.5" width="79" height="79" stroke="white"></rect>
                    <rect x="202.5" y="357.5" width="79" height="79" stroke="white"></rect>
                    <rect x="281.5" y="357.5" width="79" height="79" stroke="white"></rect>
                    <rect x="360.5" y="357.5" width="79" height="79" fill="white" fill-opacity="0.25" stroke="white"></rect>
                    <rect x="439.5" y="357.5" width="79" height="79" stroke="white"></rect>
                    <rect x="518.5" y="357.5" width="79" height="79" stroke="white"></rect>
                    <rect x="597.5" y="357.5" width="79" height="79" stroke="white"></rect>
                    <rect x="676.5" y="357.5" width="79" height="79" stroke="white"></rect>
                    <rect x="755.5" y="357.5" width="79" height="79" stroke="white"></rect>
                    <rect x="123.5" y="436.5" width="79" height="79" stroke="white"></rect>
                    <rect x="202.5" y="436.5" width="79" height="79" stroke="white"></rect>
                    <rect x="281.5" y="436.5" width="79" height="79" stroke="white"></rect>
                    <rect x="360.5" y="436.5" width="79" height="79" stroke="white"></rect>
                    <rect x="439.5" y="436.5" width="79" height="79" stroke="white"></rect>
                    <rect x="518.5" y="436.5" width="79" height="79" stroke="white"></rect>
                    <rect x="597.5" y="436.5" width="79" height="79" stroke="white"></rect>
                    <rect x="676.5" y="436.5" width="79" height="79" stroke="white"></rect>
                    <rect x="755.5" y="436.5" width="79" height="79" stroke="white"></rect>
                    <rect x="123.5" y="515.5" width="79" height="79" stroke="white"></rect>
                    <rect x="202.5" y="515.5" width="79" height="79" stroke="white"></rect>
                    <rect x="281.5" y="515.5" width="79" height="79" stroke="white"></rect>
                    <rect x="360.5" y="515.5" width="79" height="79" stroke="white"></rect>
                    <rect x="439.5" y="515.5" width="79" height="79" stroke="white"></rect>
                    <rect x="518.5" y="515.5" width="79" height="79" stroke="white"></rect>
                    <rect x="597.5" y="515.5" width="79" height="79" stroke="white"></rect>
                    <rect x="676.5" y="515.5" width="79" height="79" stroke="white"></rect>
                    <rect x="755.5" y="515.5" width="79" height="79" stroke="white"></rect>
                </g>
                <defs>
                    <filter id="filter0_f_1_167" x="161" y="1.14441e-05" width="637" height="637" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                        <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_1_167"></feGaussianBlur>
                    </filter>
                    <radialGradient id="paint0_radial_1_167" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(480 318.5) rotate(90) scale(353.19 591.732)">
                        <stop stop-color="#D9D9D9" stop-opacity="0.2"></stop>
                        <stop offset="0.802083" stop-color="#D9D9D9" stop-opacity="0"></stop>
                    </radialGradient>
                </defs>
            </svg>
            <div className="relative flex flex-col items-center justify-center max-w-6xl px-8 py-12 mx-auto lg:py-24">
                <div>
                    <span className="text-6xl font-bold tracking-wide text-white uppercase">Pricing</span>
                    <p className="mt-8 text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                        Equip your business
                        <span className="md:block"> with AI SWARM</span>
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 mt-12 lg:ap-2 lg:grid-cols-2">
                    <div className="lg:order-last max-w-sm">
                        <div className="flex flex-col">
                            <div className="p-8 shadow-2xl rounded-3xl bg-gradient-to-b from-primary via-primary to-secondary ring-1 ring-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-8 h-8 text-black rounded-full" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="280" height="280" rx="32" fill="#fff"></rect>
                                            <g clip-path="url(#clip0_501_1474)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M160 54.2857C160 46.3959 153.604 40 145.714 40H134.286C126.396 40 120 46.3959 120 54.2857V57.2269C120 69.9541 104.612 76.3279 95.6128 67.3284L93.533 65.2487C87.9541 59.6698 78.9089 59.6698 73.3299 65.2487L65.2487 73.3299C59.6698 78.9088 59.6698 87.954 65.2487 93.533L67.3285 95.6128C76.328 104.612 69.9542 120 57.227 120H54.2857C46.3959 120 40 126.396 40 134.286V145.714C40 153.604 46.3959 160 54.2857 160H57.2269C69.9542 160 76.328 175.388 67.3285 184.387L65.2487 186.467C59.6698 192.046 59.6698 201.091 65.2487 206.67L73.3299 214.751C78.9089 220.33 87.9541 220.33 93.533 214.751L95.6128 212.671C104.612 203.672 120 210.046 120 222.773V225.714C120 233.604 126.396 240 134.286 240H145.714C153.604 240 160 233.604 160 225.714V222.773C160 210.046 175.388 203.672 184.387 212.671L186.467 214.751C192.046 220.33 201.091 220.33 206.67 214.751L214.751 206.67C220.33 201.091 220.33 192.046 214.751 186.467L212.672 184.387C203.672 175.388 210.046 160 222.773 160H225.714C233.604 160 240 153.604 240 145.714V134.286C240 126.396 233.604 120 225.714 120H222.773C210.046 120 203.672 104.612 212.671 95.6128L214.751 93.5329C220.33 87.954 220.33 78.9088 214.751 73.3299L206.67 65.2487C201.091 59.6697 192.046 59.6697 186.467 65.2487L184.387 67.3284C175.388 76.3279 160 69.9541 160 57.2269V54.2857Z" fill="currentColor"></path>
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_501_1474">
                                                    <rect width="200" height="200" fill="white" transform="translate(40 40)"></rect>
                                                </clipPath>
                                            </defs>
                                        </svg>
                                        <p className="text-base font-medium text-white uppercase">
                                            {pricingData.Enterprise.title}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-8 text-sm font-medium text-white">
                                    {pricingData.Enterprise.description}
                                </p>
                                <div className="flex mt-6">
                                    <Link
                                        className={cn(
                                            "items-center justify-between inline-flex w-full font-medium",
                                            "px-6 py-2.5 text-center text-black duration-200 bg-white rounded-xl",
                                            "h-14 hover:bg-white/20 hover:border-white hover:text-white focus:outline-none",
                                            "focus-visible:outline-black text-base focus-visible:ring-black"
                                        )}
                                        href={pricingData.Enterprise.link}>
                                        {
                                            pricingData.Enterprise.buttonTitle
                                        }
                                    </Link>
                                </div>
                            </div>
                            {
                                !!pricingData.Enterprise.features.length &&
                                <div className="px-8">
                                    <div>
                                        <p className="mt-4 text-lg font-medium text-white uppercase lg:mt-8">
                                            Features
                                        </p>
                                        <ul className="gap-4 mt-4 space-y-3 text-gray-300 list-none" role="list">
                                            {
                                                pricingData.Enterprise.features.map((item, index) => {
                                                    return (
                                                        <li key={`FEATURE_${item}-${index}`} className="flex items-center gap-2">
                                                            <CheckCircle className='size-4 text-gray-500 icon icon-tabler icon-tabler-circle-check' />
                                                            <span> {item}</span>
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="max-w-sm">
                        <div className="flex flex-col">
                            <div className="p-8 rounded-3xl bg-[#1c1f29] ring-1 ring-white/10 shadow-2xl">
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-8 h-8 text-black rounded-full" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="280" height="280" rx="32" fill="#d1cfdf"></rect>
                                            <g clip-path="url(#clip0_501_1489)">
                                                <path d="M196.064 183.936L152.127 140L196.064 96.0636L240 140L196.064 183.936ZM83.9364 183.936L40 140L83.9364 96.0636L127.873 140L83.9364 183.936ZM140 240L96.0636 196.064L140 152.127L183.936 196.064L140 240ZM140 127.873L96.0636 83.9364L140 40L183.936 83.9364L140 127.873Z" fill="currentColor"></path>
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_501_1489">
                                                    <rect width="200" height="200" fill="white" transform="translate(40 40)"></rect>
                                                </clipPath>
                                            </defs>
                                        </svg>
                                        <p className="text-base font-medium text-white uppercase">
                                            {pricingData.Premium.title}
                                        </p>
                                    </div>
                                    <p>
                                        <span className="text-lg font-medium text-white uppercase lg:text-xl">
                                            ${pricingData.Premium.price}</span>
                                        <span className="text-base font-medium text-gray-500"> /mo</span>
                                    </p>
                                </div>
                                <p className="mt-8 text-sm font-medium text-gray-300">
                                    {pricingData.Premium.description}
                                </p>
                                <div className="flex mt-6">
                                    <Link
                                        className={cn(
                                            "items-center justify-between inline-flex w-full font-medium px-6 py-2.5 text-center", 
                                            "text-white duration-200 bg-white/5 border", 
                                            "border-white/5 rounded-xl h-14 hover:bg-white/10 hover:border-white/10",
                                             "focus:outline-none focus-visible:outline-black text-base focus-visible:ring-black"
                                        )}
                                        href={pricingData.Premium.link}>
                                        {
                                            pricingData.Premium.buttonTitle
                                        }
                                    </Link>
                                </div>
                            </div>
                            <div className="px-8">
                                <div>
                                    <p className="mt-4 text-lg font-medium text-white uppercase lg:mt-8">
                                        Features
                                    </p>
                                    <ul className="order-last gap-4 mt-4 space-y-3 text-gray-300 list-none" role="list">
                                        {
                                            pricingData.Premium.features.map((item, index) => {
                                                return (
                                                    <li className="flex items-center gap-2">
                                                        <CheckCircle className='size-4 text-gray-500 icon icon-tabler icon-tabler-circle-check' />
                                                        <span>{item}</span>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
};

export default Pricing;

