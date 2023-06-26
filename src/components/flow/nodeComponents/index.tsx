import QueryDefaultNode from './QueryDefaultNode';
import QueryClickNode from './QueryClickNode'
import QueryReadNode from './QueryReadNode';
import QueryInputNode from './QueryInputNode';
import APINode from './APINode';
import RoleNode from './RoleNode';
import PromptNode from './PromptNode';
import CustomPromptNode from './CustomPromptNode';
import UserInputTextNode from './UserInputTextNode'
import FilePPTCreateNode from './FilePPTCreateNode'

import i18n from "i18next";


const getNodes = () => [{
    title: i18n.t('roleNodeTitle'),
    children: [
        {
            key: 'role',
            component: RoleNode,
            parent: 'role',
            name: i18n.t('createRole'),
            disabled: true
        }
    ]
},
{
    title: i18n.t('llm'),
    children: [{
        key: 'prompt',
        component: PromptNode,
        parent: 'llm',
        name: i18n.t('promptNodeTitle')
    }, {
        key: 'promptCustom',
        component: CustomPromptNode,
        parent: 'llm',
        name: i18n.t('customPromptNodeTitle')
    }
        // {
        //     key: 'embeddings',
        //     component: EmbeddingsNode,
        //     parent: 'llm',
        //     name: i18n.t('embeddingsNodeTitle')
        // },
    ],
    open: true
},
{
    title: i18n.t('inputMenu'),
    children: [{
        key: 'userInputText',
        component: UserInputTextNode,
        parent: 'input',
        name: i18n.t('userInputText')
    }
    ],
},
{
    title: i18n.t('webAgent'),
    children: [
        {
            key: 'queryDefault',
            component: QueryDefaultNode,
            parent: 'query',
            name: i18n.t('queryDefaultNodeTitle')
        },
        {
            key: 'queryClick',
            component: QueryClickNode,
            parent: 'query',
            name: i18n.t('queryClickNodeTitle')
        },
        {
            key: 'queryRead',
            component: QueryReadNode,
            parent: 'query',
            name: i18n.t('queryReadNodeTitle')
        },
        {
            key: 'queryInput',
            component: QueryInputNode,
            parent: 'query',
            name: i18n.t('queryInputNodeTitle')
        },
    ]

},
{
    title: 'API',
    children: [
        {
            key: 'api',
            component: APINode,
            parent: 'api',
            name: i18n.t('apiNodeTitle')
        }
    ]
},
{
    title: 'File',
    children: [
        {
            key: 'file-ppt-create',
            component: FilePPTCreateNode,
            parent: 'file',
            name: i18n.t('filePPTNodeTitle')
        }
    ]
},
    // {
    //     title: '翻译',
    //     children: [
    //         {
    //             key: 'translate',
    //             component: TranslateNode,
    //             parent: 'translate',

    //             name: '翻译'
    //         }
    //     ]
    // }
]






export default getNodes;
