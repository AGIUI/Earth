import styled from 'styled-components';

const App = styled.div`
  width: 100%;
  margin: 0px;
  padding: 0px;
`
const Header = styled.div`
  width: 100%;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(26, 26, 26, 0.1);
  border-bottom: 1px solid #e6e6e6;
  z-index: 100;
  position: fixed;
  top: 0;
`;

const Header_Content: any = styled.div`
  margin: auto; /* 左右居中 */
  @media screen and (max-width: 1920px) {
    width: 1456px;
  }

  @media screen and (max-width: 1280px) {
    width: 1102px;
  }

  @media screen and (max-width: 768px) {
    width: 748px;
  }

  @media screen and (max-width: 400px) {
    width: 394px;
  }
`

const Logo: any = styled.img`
  margin-top: 15px;
  height: 30px;
`

const Article = styled.div`
  width: 100%;
  display: flex;
  justify-content: center; /* 水平居中 */
`;

const Contents: any = styled.div`
  margin: auto; /* 左右居中 */
  padding-top: 20px;
  border-top: 1px solid #e6e6e6;
  padding-left: 20px;
  padding-right: 20px;

  @media screen and (max-width: 1920px) {
    width: 1456px;
    column-count: 4;
  }

  @media screen and (max-width: 1280px) {
    width: 1102px;
    column-count: 3;
  }

  @media screen and (max-width: 768px) {
    width: 748px;
    column-count: 2;
  }

  @media screen and (max-width: 400px) {
    width: 394px;
    column-count: 1;
    width: 100%;
  }
`

const Content_Img: any = styled.img`
  width: 300px;
  height: 150px;
  object-fit: cover;
  object-position: center center;
  border-radius: 20px;
`

const Content_Title: any = styled.h3`
  font-size: medium;
  margin-top: 0px;
  margin-bottom: 8px;
  height: 3em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  text-align: justify;
`
const Link: any = styled.a`
  color: black; /* 设置颜色为纯黑色 */
  text-decoration: none; /* 去掉下划线 */
`

const Content_Description: any = styled.p`
  font-size: medium;
  height: 3em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  text-overflow: ellipsis;
  margin-top: 8px;
  margin-bottom: 8px;
  text-align: justify;
`

const Favicon: any = styled.img`
  width: 14px;
  height: 14px;
  margin-right: 4px;
`

const Domain: any = styled.div`
  display: flex;
  align-items: center;
`
const Search: any = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center; /* 垂直居中 */
  justify-content: flex-end; /* 底部对齐 */
  margin: auto;
  @media screen and (min-width: 1920px) {
    height: 350px;
  }
  
  @media screen and (max-width: 1919px) {
    height: 350px;
  }

  @media screen and (max-width: 1280px) {
    height: 250px;
  }

  @media screen and (max-width: 768px) {
    height: 200px;

  }

  @media screen and (max-width: 400px) {
    height: 200px;
  }
`;


const Form: any = styled.div`
  width: 600px;
  height: 50px;
  display: flex;
  align-items: center;
  border-radius: 25px;
  background-color: #fff;
  box-shadow: rgb(230 230 230) 0px 1px 2px 0px;
  border: 1px solid #e2e2e2;
  overflow: hidden;
`

const Search_Icon: any = styled.img`
  width: 30px;
  margin-left: 10px;
  margin-right: 10px;
`

const Input: any = styled.input`
  font-size: 1.2rem;
  padding: 8px;
  width: 500px;
  margin-right: 10px;
  border: none;
  background: transparent;
  flex: 1;
  outline: none; /* 移除选中时出现的黑框 */
`
const AI: any = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: center; /* 水平居中 */
  margin-bottom: 50px;
  margin-top: 30px;
`

const Assistant: any = styled.div`
  position: relative;
  width: 80px;
  padding: 0px;
  margin-left: 5px;
  margin-right: 5px;
  text-align: center;
  display: block;
`

const Assistant_Img: any = styled.img`
  width: 50px;
  height: 50px;
  margin-bottom: 4px;
  border-radius: 50%;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,.2);
`

const F_Copilots: any = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  margin-bottom: 30px;
  margin-top: 30px;
`
const All_Copilots: any = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  margin-bottom: 30px;
  margin-top: 30px;
  overflow: auto;
  padding: 0 10px;
  overflow-x:hidden;
  ::-webkit-scrollbar-track-piece {
    -webkit-border-radius: 4px;
  }
  ::-webkit-scrollbar {
    width: 8px;
    height: 10px
  }
  ::-webkit-scrollbar-thumb {
    height: 50px;
    background-color: #b8b8b8;
    -webkit-border-radius: 6px;
    outline-offset: -2px;
    filter: alpha(opacity = 50);
    -moz-opacity: 0.5;
    -khtml-opacity: 0.5;
    opacity: 0.5
  }
  ::-webkit-scrollbar-thumb:hover {
    height: 50px;
    background-color: #878987;
    -webkit-border-radius: 6px
  }
`
const Copilots_Head: any = styled.div`
    display: flex;
    width: 100%;
`
const Copilots_Title: any = styled.p`
  font-size: medium;
  margin-left: 10px;
  height: 3em;
  overflow: hidden;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  margin-top: 12px;
  margin-bottom: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
`
const Copilots_Bottom: any = styled.div`
    display: flex;
    width: 100%;
`

const Copilots_Description: any = styled.p`
  font-size: small;
  height: 5em;
  overflow: hidden;
  -webkit-line-clamp: 3;
  text-overflow: ellipsis;
  margin-top: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
`

export {
    App, Header, Header_Content, Logo, Article, Search, Contents,
    Content_Img, Favicon, Content_Title, Content_Description, Link, Domain,
    Form, Input, Search_Icon,
    AI,Assistant,Assistant_Img,
    F_Copilots,
    All_Copilots,Copilots_Head,Copilots_Title,Copilots_Description,Copilots_Bottom
}

