import { useEffect, useState, useTransition } from "react";
import "./App.css";

async function exampleAPI(): Promise<Cat> {
  try {
    const url = "https://api.thecatapi.com/v1/images/search?limit=100";

    const res = await fetch(url);
    const cats = await res.json();
    const randNumber = Math.round(Math.random() * 9);
    const randCatId = cats[randNumber].id;

    const url2 = `https://api.thecatapi.com/v1/images/${randCatId}`;
    const result = await fetch(url2);
    const catData = await result.json();

    const catBreedData =
      catData.hasOwnProperty("breeds") && catData.breeds.length > 0
        ? catData.breeds[0]
        : {};
    const transformedCatData: Cat = {
      id: catData.id,
      imageUrl: catData.url,
      breedName: catBreedData.name || "Breed Unknown",
      description: catBreedData.description || "No Description",
      originCountry: catBreedData.origin || "Unknown Origin",
    };

    return transformedCatData;
  } catch (err) {
    console.error("Error: ", err);
    return {} as Cat;
  }
}

function SkeletonLoader() {
  return (
    <>
      <div
        role="status"
        className="max-w-sm p-4 border border-gray-200 rounded-sm shadow-sm animate-pulse md:p-6 dark:border-gray-700 w-[500px]"
      >
        <div className="flex items-center justify-center h-48 mb-4 bg-gray-300 rounded-sm dark:bg-gray-700">
          <svg
            className="w-10 h-10 text-gray-200 dark:text-gray-600"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 20"
          >
            <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
            <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
          </svg>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        <div className="flex items-center mt-4">
          <svg
            className="w-10 h-10 me-3 text-gray-200 dark:text-gray-700"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
          </svg>
          <div>
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
            <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
          </div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
}
type Cat = {
  id: string;
  breedName: string;
  description: string;
  originCountry: string;
  imageUrl: string;
};
function CatCard({ cat }: { cat: Cat }) {
  return (
    <>
      <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <a href="#">
          <img className="rounded-t-lg" src={cat.imageUrl} alt="" />
        </a>
        <div className="p-5">
          <a href="#">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {cat.breedName}
            </h5>
          </a>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            {cat.description}
          </p>
        </div>
      </div>
    </>
  );
}


function SWLifeCycleDiagram() {
  return <>
    <div className="w-full border-2 border-emerald-600 mb-[50px]">
      <p className="text-xl font-3 text-orange-500 p-3">Service Worker Architecture</p>
      <img src="/sw_lifecycle.svg" />
    </div>
    <a className="p-2 mb-[20px] text-blue-400" href="https://developer.chrome.com/docs/workbox/caching-strategies-overview" target="_blank"> Chrome - Caching Strategies</a>
    <div className="w-full border-2 border-emerald-600 mt-[10px] mb-[50px]">
      <p className="text-xl font-3 text-orange-500 p-3">Cache First</p>
      <img src="/sw_cache_first.png" />
    </div>
    <div className="w-full border-2 border-emerald-600 mb-[50px]">

      <p className="text-xl font-3 text-orange-500 p-3">Network First</p>
      <img src="/sw_network_first.png" />
    </div>
    <div className="w-full border-2 border-emerald-600 mb-[50px]">

      <p className="text-xl font-3 text-orange-500 p-3">Stale While Revalidate</p>
      <img src="/sw_stale_while_revalidate.png" />
    </div>

  </>
}
function App() {
  const [isPending, startTransition] = useTransition();
  const [UIStates, setUIStates] = useState({
    showExampleAPIDemo: false,
    showSWLifecycle: false
  })
  const [catData, setCatData] = useState({} as Cat);


  /// NEVER DO THIS: This is for demo purpose
  const hitNonExistentAPI = async () => {
    const url = 'https://example.com/api/v2/unknown'
    const res = await fetch(url)
    const json = await res.json()
    console.log('NON Existent API Response: ', json)
  }
  const setUIToggles = (type: string) => {
    const validKeys = new Map([['CACHE_API_DEMO', 'showExampleAPIDemo'], ['SW_LIFE_CYCLE', 'showSWLifecycle']])
    if (!validKeys.has(type)) return;
    const objKey = validKeys.get(type) as string
    setUIStates((prev: any) => ({ ...prev, [objKey]: !prev[objKey] }))
  }

  const fetchCatData = () => {
    startTransition(async () => {
      const data = await exampleAPI();
      setCatData(data);
    });
  };
  useEffect(() => {
    fetchCatData();
  }, []);

  return (
    <>
      <div className="w-[1000px] ml-auto mr-auto pt-[30px]">

        <h3 className="text-3xl text-teal-600 text-center my-[10px] font-bold">Service Worker </h3>

        <div className="flex gap-3">

          <button
            className="p-3 rounded-md bg-teal-600 cursor-pointer text-white text-md mb-7"
            onClick={() => setUIToggles('SW_LIFE_CYCLE')}
          >
            Service Worker Lifecyle
          </button>
          <button
            className="p-3 rounded-md bg-teal-600 cursor-pointer text-white text-md mb-7"

            onClick={() => setUIToggles('CACHE_API_DEMO')}
          >
            Caching Example API
          </button>
          <button
            className="p-3 rounded-md bg-teal-600 cursor-pointer text-white text-md mb-7"
            onClick={hitNonExistentAPI}
          >
            Hit Non-Existent API
          </button>

        </div>
        {/* SW LIFE CYCLE */}
        {UIStates.showSWLifecycle && <SWLifeCycleDiagram />
        }


        {/* CACHE API DEMO */}
        {UIStates.showExampleAPIDemo && <div>

          <button
            className="p-3 rounded-md bg-teal-600 cursor-pointer text-white text-md mb-7"
            onClick={fetchCatData}
          >
            Fetch Cat Data!
          </button>
          {isPending ? <SkeletonLoader /> : <CatCard cat={catData} />}
        </div>
        }



      </div>
    </>
  );
}

export default App;
