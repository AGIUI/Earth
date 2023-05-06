import React from "react";

import logo from "@assets/img/logo.svg";

// let bg = chrome.extension.getBackgroundPage();
// console.log(bg)


class Popup extends React.Component<{}, {
  extension: any
 }> {

  constructor(props: any) {
    super(props)
    this.state={
      extension:chrome.extension
    }
    this.init();
  }

  init(){
    console.log(chrome.extension)
  }

  render() {
    return <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <img src={logo} className="h-36 pointer-events-none animate-spin-slow" alt="logo" />
        <p>
          Edit <code>src/pages/popup/Popup.jsx</code> and save to reload.
        </p>
        <a
          className="text-blue-400"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a>
        <button onClick={() => {
          let extension=this.state.extension;
          if(extension) console.log(extension.getBackgroundPage,extension.getBackgroundPage())
          // chrome.runtime.sendMessage({
          //   cmd: 'get-data-base',
          //   data: {
          //     databaseId: 'a98063d9f09044c7be65efc7ebb7d283'
          //   }
          // }, response => {
          //   // console.log(response)
          // });
        }}>test</button>
      </header>
    </div>
  }
}

export default Popup;

// export default function Popup(): JSX.Element {
//   return (
//     <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
//       <header className="flex flex-col items-center justify-center text-white">
//         <img src={logo} className="h-36 pointer-events-none animate-spin-slow" alt="logo" />
//         <p>
//           Edit <code>src/pages/popup/Popup.jsx</code> and save to reload.
//         </p>
//         <a
//           className="text-blue-400"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React!
//         </a>
//         <button onClick={()=>{
//           chrome.runtime.sendMessage({
//             cmd: 'get-data-base',
//             data: {
//               databaseId:'a98063d9f09044c7be65efc7ebb7d283'
//             }
//           }, response => {
//             // console.log(response)
//           });
//         }}>test</button>
//       </header>
//     </div>
//   );
// }
