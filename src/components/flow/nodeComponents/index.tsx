import QueryDefaultNode from './QueryDefaultNode';
import QueryClickNode from './QueryClickNode'
import QueryReadNode from './QueryReadNode';
import QueryInputNode from './QueryInputNode';
import APINode from './APINode';
import RoleNode from './RoleNode';
import PromptNode from './PromptNode';

const nodes =
    [{
        title: '角色',
        children: [
            {
                key: 'role',
                component: RoleNode,
                parent: 'role',
                name: '角色定义',
                disabled:true
            }
        ]
    },
    {
        title: '提示工程',
        children: [{
            key: 'prompt',
            component: PromptNode,
            parent: 'prompt',
            name: '提示工程'
        },

        ]
    },
    {
        title: '网页代理器',
        children: [
            {
                key: 'queryDefault',
                component: QueryDefaultNode,
                parent: 'query',
                name: '进入网页'
            },
            {
                key: 'queryClick',
                component: QueryClickNode,
                parent: 'query',
                name: '模拟点击事件'
            },
            {
                key: 'queryRead',
                component: QueryReadNode,
                parent: 'query',
                name: '内容读取'
            },
            {
                key: 'queryInput',
                component: QueryInputNode,
                parent: 'query',
                name: '文本输入'
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
                name: 'API调用'
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






export default nodes;
