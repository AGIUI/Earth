import styled from 'styled-components';

const Wrapper = styled.section`
  background:linear-gradient(358.31deg,#fff -24.13%,hsla(0,0%,100%,0) 338.58%),linear-gradient(89.84deg,rgba(230,36,174,.15) .34%,rgba(94,58,255,.15) 16.96%,rgba(10,136,255,.15) 34.66%,rgba(75,191,80,.15) 50.12%,rgba(137,206,0,.15) 66.22%,rgba(239,183,0,.15) 82%,rgba(246,73,0,.15) 99.9%);
  border-radius:8px;
  border:1px solid rgba(217,225,236,.2)
`;

// user-select: none !important;
const Base: any = styled.div`
box-sizing: border-box;

`

const Flex: any = styled(Base)`
display:${(props: any) => props.display || 'none'};
`

const FlexRow: any = styled(Flex)`
justify-content: space-between;
flex-direction: row;
`

const FlexColumn: any = styled(Flex)`
justify-content: space-between;
flex-direction: row;
height:100%;
position:fixed;
z-index:1050;
/*2147483600*/
top :0;
right:0;
text-align: left;
box-shadow:0 0px 1px 0px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)
`

const Header = styled(FlexRow)`
padding: 12px;
`;

const Title = styled.h1`
font-weight: 800;
line-height: 30px;
text-align: left;
font-size: 24px !important;
color: rgb(33, 41, 60) !important;
`;

const Icon: any = styled.span`
display:${(props: any) => props.display || 'flex'};
    align-items: center;
    justify-content: center;
    background: rgba(75,88,124,.05);
    border-radius: 12px;
    padding: 4px;
    filter: opacity(0.5);
    width: ${(props: any) => (props.size || '32') + 'px'};
    height: ${(props: any) => (props.size || '32') + 'px'};
    cursor: pointer;

    &:hover {
      background: #91daff !important;
      cursor: pointer;
    }
    
    `

const Loading: any = styled(Flex)`
display: inline-block;
position: relative;
width: 80px;
height: 80px;
position: fixed;
left:calc(50% - 40px);
top:calc(50% - 80px);
z-index:999999999999999999999;
  &:after {
    content: " ";
    display: block;
    border-radius: 50%;
    width: 0;
    height: 0;
    margin: 8px;
    box-sizing: border-box;
    border: 32px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: lds-hourglass 1.2s infinite;
  }
  @keyframes lds-hourglass {
    0% {
      transform: rotate(0);
      animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }
    50% {
      transform: rotate(900deg);
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    100% {
      transform: rotate(1800deg);
    }
  }

`

const Content: any = styled(Flex)`
    display:${(props: any) => props.display || 'none'};
    height:${(props: any) => props.height || '100%'}; 
    flex-direction: column;
    overflow-y: scroll;
    overflow-x: hidden;
    margin: 4px 0;
    &::-webkit-scrollbar
    {
      width:2px;
    }
    &::-webkit-scrollbar-track
    {
      border-radius:25px;
      -webkit-box-shadow:inset 0 0 5px rgba(255,255,255, 0.5);
      background:rgba(255,255,255, 0.5);
    }
    &::-webkit-scrollbar-thumb
    {
      border-radius:15px;
      -webkit-box-shadow:inset 0 0 5px rgba(0, 0,0, 0.2);
      background:rgba(0, 0,0, 0.2);
    }
    & h1,h2{
      margin: 12px 0;
      font-weight: 800;
    }
    & p,li{
      margin: 6px 0;
    }
`

const MergeCard: any = styled.div`
background: #fff;
padding: 12px;
border:${(props: any) => props.border || '1px solid #d9e1ec'};
height: ${(props: any) => props.height || '240px'};
max-width: calc(100% - 360px);
min-width:360px;
width:${(props: any) => props.width || 'auto'};
margin-bottom: 24px;
overflow-y: scroll;
display:${(props: any) => props.display || 'block'};
&::-webkit-scrollbar
    {
      width:2px;
    }
    &::-webkit-scrollbar-track
    {
      border-radius:25px;
      -webkit-box-shadow:inset 0 0 5px rgba(255,255,255, 0.5);
      background:rgba(255,255,255, 0.5);
    }
    &::-webkit-scrollbar-thumb
    {
      border-radius:15px;
      -webkit-box-shadow:inset 0 0 5px rgba(0, 0,0, 0.2);
      background:rgba(0, 0,0, 0.2);
    }

& h2{
  margin: 24px 0;
}
  
  & p{
    display: block;
    font-size: 18px;
    line-height: 30px;
    font-weight: 400;
    padding-bottom: 14px;
  }
 
  & p strong{
    display: contents;
  }
`

const Card: any = styled.div`
justify-content: center;
align-items: center;
padding: 6px 24px;
font-size:14px !important;
font-weight: 400;
max-height: calc(56% - 44px);
& a{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    vertical-align: top;
    top: -1px;
    margin: 0px 2px;
    min-width: 14px;
    height: 14px;
    border-radius: 3px;
    text-decoration-color: transparent;
    color: dodgerblue;
    background: paleturquoise;
    outline: transparent solid 1px;
}
& h2{
  font-weight: 800;
  font-size: 14px;
}
& ol{
  padding: 0 16px;
}
& li{
  margin: 14px 0px;
}
& li::marker{
  color: dodgerblue;
}

`




const Button: any = styled.button`
display:${(props: any) => props.display || 'flex'};
background: rgba(75, 88, 124, 0.05) !important;
border-radius: 6px;
border-width: 1px;
border-color: #d9d9d9;
align-items: center;
font-weight: 500;
font-size: 14px !important;
line-height: 14px;
padding: 0 8px;
color: black !important;
height:36px;
&:hover {
  background: #91daff !important;
  cursor: pointer;
}
`


const Tabs: any = styled(FlexRow)`
    justify-content: flex-start;
`

const ButtonMin: any = styled(Button)`
border:none;
margin: 0 12px;
color: ${(props: any) => props.selected == 'yes' ? '#243c6c!important ' : '#4a4a4a'};;
height: 28px;
border-radius: 2px;
border-bottom: 2px solid ${(props: any) => props.selected == 'yes' ? '#0c7eb9' : 'none'};
background-color: ${(props: any) => props.selected == 'yes' ? '#10aeff26 !important' : 'none'};
`


// 交互输入
const InputCard: any = styled(Flex)`
    box-shadow: rgba(19, 21, 22, 0.04) 0px 8px 12px -2px, rgba(19, 21, 22, 0.02) 0px 4px 8px;
    border: 1px solid lightgrey;
    justify-content: center;
    align-items: flex-end;
    flex-wrap: wrap;
    margin: 4px 8px;
    background: rgb(255, 255, 255);
    border-radius: 8px;
    width: calc(100% - 16px);
`
// 输入框
const Input: any = styled(Flex)`
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0;
  min-height: 32px;
  width: 100%;
  font-size: 12px !important;
  padding: 12px;
  outline:none;
  border:none;
  text-align: left;color: black;
  &::before {
    content: attr(placeholder);
    opacity: .4;
    width: 100%;
    margin: 0;
    position: absolute;
    cursor: text;color: black;
  }`;

const Buttons: any = styled(FlexRow)`
  margin-bottom: 4px;
  padding: 12px;
  `;

const Prompt: any = styled(FlexRow)`
    margin-bottom: 4px;
    padding: 12px;
    align-items: center;
`;



const shareIconSvg = <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7 4.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-1.68-.919L5.681 6.92m.001 2.161 3.637 2.338" stroke="#4B587C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
const talkIconSvg = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M17.7 332.3h412.7v22c0 37.7-29.3 68-65.3 68h-19L259.3 512v-89.7H83c-36 0-65.3-30.3-65.3-68v-22zm0-23.6h412.7v-85H17.7v85zm0-109.4h412.7v-85H17.7v85zM365 0H83C47 0 17.7 30.3 17.7 67.7V90h412.7V67.7C430.3 30.3 401 0 365 0z" /></svg>

export {
  Wrapper,
  shareIconSvg, talkIconSvg,
  Flex, FlexColumn, FlexRow, Button, Prompt, Buttons, Input, InputCard, ButtonMin, Tabs, Card, Header, Title, Icon, Loading, Content,
  MergeCard,
}