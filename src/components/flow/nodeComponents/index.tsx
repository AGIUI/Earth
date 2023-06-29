import QueryDefaultNode from './QueryDefaultNode';
import QueryClickNode from './QueryClickNode'
import QueryReadNode from './QueryReadNode';
import QueryInputNode from './QueryInputNode';
import QueryScrollNode from "./QueryScrollNode";
import APINode from './APINode';
import RoleNode from './RoleNode';
import PromptNode from './PromptNode';
import CustomPromptNode from './CustomPromptNode';
import UserInputTextNode from './UserInputTextNode'
import FilePPTCreateNode from './FilePPTCreateNode'
import InputMergeNode from './InputMergeNode'

import i18n from "i18next";


const getNodes = () => [{
    key: 'role',
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
    key: 'llm',
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
    key: 'input',
    title: i18n.t('inputMenu'),
    children: [{
        key: 'userInputText',
        component: UserInputTextNode,
        parent: 'input',
        name: i18n.t('userInputText')
    },
    {
        key: 'inputMerge',
        component: InputMergeNode,
        parent: 'input',
        name: i18n.t('inputMerge')
    }
    ],
},
{
    key: 'query',
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
        // {
        //     key: 'queryScroll',
        //     component: QueryScrollNode,
        //     parent: 'query',
        //     name: i18n.t('queryScrollNodeTitle')
        // },
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
    key: 'api',
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
    key: 'file',
    title: 'File',
    children: [
        {
            key: 'file-ppt-create',
            component: FilePPTCreateNode,
            parent: 'file',
            name: i18n.t('filePPTNodeTitle')
        }
    ]
}
]


export default getNodes;
