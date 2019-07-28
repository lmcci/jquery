/*!
 * jQuery JavaScript Library v2.0.3
 * http://jquery.com/
 *
 * css选择器 jq包含sizzle 可以独立使用
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-07-03T13:30Z
 */

// 传window 是为了方便压缩，为了减少全局变量的查询时间（相当于用了局部变量）
// 传undefined  他不是关键字 也不是保留字 可以当成变量名 被赋值 为了减少问题这里定义了局部变量
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335) issue编号
// Support: Firefox 18+
//    不使用严格模式
//"use strict";
//    todo 定义变量和函数
    var
        // A central reference to the root jQuery(document)
        // $(document) document的jq对象 为了压缩变量名
        rootjQuery,

        // The deferred used on DOM ready
        // dom加载
        readyList,

        // Support: IE9
        // For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
        // typeof undefined 得到 'undefined' 字符串
        core_strundefined = typeof undefined,

        // Use the correct document accordingly with window argument (sandbox)
        // 压缩变量名
        location = window.location,
        document = window.document,
        docElem = document.documentElement,

        // Map over jQuery in case of overwrite
        // 防止冲突 先把已经存在的jQuery缓存下来
        _jQuery = window.jQuery,

        // Map over the $ in case of overwrite
        // 防止冲突 先把已经存在的$缓存下来
        _$ = window.$,

        // [[Class]] -> type pairs
        // 判断变量类型 最终会有 {'[object Object]': 'object', ''}
        class2type = {},

        // List of deleted data cache ids, so we can reuse them
        // 缓存数据相关 这个版本没有用
        core_deletedIds = [],

        // jq版本号
        core_version = "2.0.3",

        // Save a reference to some core methods
        // 缓存数组、对象、字符串 的方法名 压缩变量名
        core_concat = core_deletedIds.concat,
        core_push = core_deletedIds.push,
        core_slice = core_deletedIds.slice,
        core_indexOf = core_deletedIds.indexOf,
        core_toString = class2type.toString,
        core_hasOwn = class2type.hasOwnProperty,
        core_trim = core_version.trim,

        // Define a local copy of jQuery
        // 本尊
        // 每次调用jQuery就会返回一个对象 不用每次调用的时候new
        // 构造函数是jQuery.fn.init
        // jQuery.fn.init.prototype = jQuery.fn;
        // jQuery.fn = jQuery.prototype
        // jQuery.prototype、jQuery.fn.init.prototype、jQuery.fn 是同一个东西
        // 所以后续对jQuery.prototype上进行扩展就可以了
        jQuery = function( selector, context ) {
            // The jQuery object is actually just the init constructor 'enhanced'
            return new jQuery.fn.init( selector, context, rootjQuery );
        },

        // Used for matching numbers
        // 匹配数字 正负数、小数点 e科学计数法  .source 字符串
        core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

        // Used for splitting on whitespace
        // 非空白字符单词
        core_rnotwhite = /\S+/g,

        // A simple way to check for HTML strings
        // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
        // Strict HTML recognition (#11290: must start with <)
        // 匹配标签 #id   （hash防止xss攻击）
        rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

        // Match a standalone tag
        // 匹配成对的标签
        rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

        // Matches dashed string for camelizing
        // 匹配ms前缀 转驼峰ms特殊 要大驼峰
        rmsPrefix = /^-ms-/,
        // -连接的 转驼峰
        rdashAlpha = /-([\da-z])/gi,

        // Used by jQuery.camelCase as callback to replace()
        // 字符串replace 转驼峰回调
        fcamelCase = function( all, letter ) {
            return letter.toUpperCase();
        },

        // The ready event handler and self cleanup method
        // dom加载成功的时候回调
        completed = function() {
            // 删除监听
            document.removeEventListener( "DOMContentLoaded", completed, false );
            window.removeEventListener( "load", completed, false );
            // 调用ready
            jQuery.ready();
        };
    // todo 定义原型 jq对象添加方法和属性
    jQuery.fn = jQuery.prototype = {
        // The current version of jQuery being used
        // 版本号
        jquery: core_version,
        // 实例对象指向的构造函数  修正指向
        constructor: jQuery,
        init: function( selector, context, rootjQuery ) {
            var match, elem;

            // HANDLE: $(""), $(null), $(undefined), $(false)
            // 对传参错误的处理
            if ( !selector ) {
                return this;
            }

            // Handle HTML strings
            if ( typeof selector === "string" ) {
                // 字符串选择器、生成dom
                if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
                    // 以<开始 以>结束 长度大于3  匹配标签 以生成dom

                    // Assume that strings that start and end with <> are HTML and skip the regex check
                    // 构建一个数组
                    match = [ null, selector, null ];

                } else {
                    // 选择器 或者 不准确的标签
                    // id选择器 和 不准确标签有值  类选择器没值
                    match = rquickExpr.exec( selector );
                }

                // Match html or make sure no context is specified for #id
                if ( match && (match[1] || !context) ) {
                    // 标签或者id选择器

                    // HANDLE: $(html) -> $(array)
                    if ( match[1] ) {
                        // 标签

                        // 第二个参数指定上下文   iframe创建dom
                        // 正常case还是undefined
                        // 如果是jQuery对象 就取第一个转 先当于换成dom元素
                        context = context instanceof jQuery ? context[0] : context;

                        // scripts is true for back-compat
                        // parseHTML 把html字符串转换成dom数组  第一个参数是要转换的字符串 第二个参数是上下文  第三个参数是字符串中包含script是否要保留
                        // merge 合并this 和 生成的dom
                        // merge可以合并两个数组 可以合并类数组
                        jQuery.merge( this, jQuery.parseHTML(
                            match[1],
                            context && context.nodeType ? context.ownerDocument || context : document,
                            true
                        ) );

                        // HANDLE: $(html, props)
                        // $(html, props) html字符串 html属性
                        // 最外层是一个标签 不是多个标签并列的  并且 传入的上下文是一个普通对象
                        if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
                            // 遍历属性对象
                            for ( match in context ) {
                                // Properties of context are called as methods if possible
                                if ( jQuery.isFunction( this[ match ] ) ) {
                                    // 如果键是jq对象的属性并且该属性是函数 就调用一次 传参是属性对象的值
                                    this[ match ]( context[ match ] );

                                    // ...and otherwise set as attributes
                                } else {
                                    // 直接给jq对象加个属性
                                    this.attr( match, context[ match ] );
                                }
                            }
                        }

                        // 初始化完成
                        return this;

                        // HANDLE: $(#id)
                    } else {
                        // id选择器

                        // 通过原生api获取到dom元素
                        elem = document.getElementById( match[2] );

                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        if ( elem && elem.parentNode ) {
                            // Inject the element directly into the jQuery object
                            // 是否能够查找到 并且非游离节点

                            // 添加dom引用 构造类数组
                            this.length = 1;
                            this[0] = elem;
                        }

                        // 上下文 和 选择器挂载在jq对象上
                        this.context = document;
                        this.selector = selector;

                        // 初始化完成
                        return this;
                    }

                    // HANDLE: $(expr, $(...))
                } else if ( !context || context.jquery ) {
                    // 没传上下文  或者  上下文是jq对象

                    // 从document找到当前选择器的jq
                    return ( context || rootjQuery ).find( selector );

                    // HANDLE: $(expr, context)
                    // (which is just equivalent to: $(context).find(expr)
                } else {
                    // 传了上下文  通过上下文创建jq对象 然后在用find查找到 jq对象并返回
                    return this.constructor( context ).find( selector );
                }

                // HANDLE: $(DOMElement)
            } else if ( selector.nodeType ) {
                // 传的是dom元素

                // 构造类数组 赋值上下文
                this.context = this[0] = selector;
                this.length = 1;
                // 初始化完成
                return this;

                // HANDLE: $(function)
                // Shortcut for document ready
            } else if ( jQuery.isFunction( selector ) ) {
                // 传函数  就是dom加载成功的回调

                // $(function(){})  $(document).ready(function(){})是同样的逻辑
                return rootjQuery.ready( selector );
            }

            // 传入的是一个jq对象
            if ( selector.selector !== undefined ) {
                this.selector = selector.selector;
                this.context = selector.context;
            }

            // 传入的数组
            // makeArray 把类数组转换成数组  传入第二个参数也是转换成类数组
            return jQuery.makeArray( selector, this );
        },

        // Start with an empty selector
        // 选择器
        selector: "",

        // The default length of a jQuery object is 0
        // 类数组的长度
        length: 0,

        // 把jq转换成dom数组
        toArray: function() {
            return core_slice.call( this );
        },

        // Get the Nth element in the matched element set OR
        // Get the whole matched element set as a clean array
        // 获取第几个dom元素
        get: function( num ) {
            // undefined == null 为true
            // 不传参就调用toArray全部返回
            return num == null ?

                // Return a 'clean' array
                this.toArray() :

                // Return just the object
                // num可以为负数 从末尾找 返回第N个元素 没有就是undefined
                ( num < 0 ? this[ this.length + num ] : this[ num ] );
        },

        // Take an array of elements and push it onto the stack
        // (returning the new matched element set)
        // 入栈
        pushStack: function( elems ) {

            // Build a new jQuery matched element set
            // 创建一个空的jq对象 和 传入的elems合并
            var ret = jQuery.merge( this.constructor(), elems );

            // Add the old object onto the stack (as a reference)
            // 合并后的对象上一个对象指定给当前的jq对象 出栈的时候（调用end()）可以往前找
            ret.prevObject = this;
            // 改变上下文
            ret.context = this.context;

            // Return the newly-formed element set
            // 返回合并的对象
            return ret;
        },

        // Execute a callback for every element in the matched set.
        // (You can seed the arguments with an array of args, but this is
        // only used internally.)
        // 类数组 for循环对每个元素执行回调
        each: function( callback, args ) {
            return jQuery.each( this, callback, args );
        },

        // dom加载 传入函数
        ready: function( fn ) {
            // Add the callback
            jQuery.ready.promise().done( fn );

            return this;
        },

        // 也是执行入栈操作
        slice: function() {
            return this.pushStack( core_slice.apply( this, arguments ) );
        },

        // 返回第一个元素
        first: function() {
            return this.eq( 0 );
        },

        // 返回最后一个元素
        last: function() {
            return this.eq( -1 );
        },

        // 返回指定位置的元素
        eq: function( i ) {
            var len = this.length,
                // 如果是负数 就加上length 从后往前数
                j = +i + ( i < 0 ? len : 0 );
            // j如果是正确的值 就调用pushStack入栈一个dom元素 返回的是一个jq对象
            return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
        },

        // 循环类数组
        map: function( callback ) {
            // 调用每个回调 返回的元素 组成数组 入栈 返回
            return this.pushStack( jQuery.map(this, function( elem, i ) {
                return callback.call( elem, i, elem );
            }));
        },

        // 出栈
        end: function() {
            // 入栈的时候对prevObject赋过值  如果没有就创建一个空jq对象
            return this.prevObject || this.constructor(null);
        },

        // For internal use only.
        // Behaves like an Array's method, not like a jQuery method.
        // 内部使用方法 类数组操作
        push: core_push,
        sort: [].sort,
        splice: [].splice
    };

// Give the init function the jQuery prototype for later instantiation
    // 修改指向
    jQuery.fn.init.prototype = jQuery.fn;

    // todo extend实现 继承 扩展到jq对象
    // extend 扩展到jq原型下 jq下 所以实例方法和静态方法都可以使用
    jQuery.extend = jQuery.fn.extend = function() {
        // 入参只有一个的时候 是往this上扩展
        // 多个入参的时候 其他的往第一个参数上扩展 浅拷贝
        // 第一个参数是true是深拷贝
        var options, name, src, copy, copyIsArray, clone,
            // 扩展的目标对象
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            // 默认浅拷贝
            deep = false;

        // Handle a deep copy situation
        // 第一个参数是布尔 证明要指定深拷贝或者浅拷贝
        if ( typeof target === "boolean" ) {
            deep = target;
            // 目标元素改成第二个
            target = arguments[1] || {};
            // skip the boolean and the target
            // 要扩展的参数列表开始索引
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        // 目标对象不是对象或者不是函数（往函数本身扩展） 就默认一个空对象
        if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        // 如果参数列表没了 就是要添加插件
        if ( length === i ) {
            // 里面的this是不同的 静态方法下this是jq方法 实例方法下this是jq原型
            target = this;
            --i;
        }

        // 循环剩余的参数
        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            // 是否有值
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                // 遍历参数本身的所有键值
                for ( name in options ) {
                    // 获取源值
                    src = target[ name ];
                    // 获取目标值
                    copy = options[ name ];

                    // Prevent never-ending loop
                    // 循环引用  要扩展的某一个属性值就是目标对象 就有死循环
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    // 深拷贝 被被拷贝的对象有值 是一个对象 或者 数组
                    if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            // 有就用原来的 没有就用空的
                            clone = src && jQuery.isArray(src) ? src : [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        // 递归调用extend
                        target[ name ] = jQuery.extend( deep, clone, copy );

                        // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        // 浅拷贝直接赋值
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };
    // todo 扩展工具方法 给$添加静态方法
    jQuery.extend({
        // Unique for each copy of jQuery on the page
        // 生成唯一的jq字符串 jq版本号 随机小数 拼接 然后替换非数字 如小数点
        expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

        // 防止冲突
        noConflict: function( deep ) {
            // _$ _jQuery 是之前缓存的

            // 是否是同一个对象  如果是同一个对象证明 window.$已经被覆盖了  再次调用noConflict的时候是希望能够放弃$
            // 所以把以前缓存的_$赋值给$
            if ( window.$ === jQuery ) {
                window.$ = _$;
            }

            // 传入的deep就放弃jQuery
            if ( deep && window.jQuery === jQuery ) {
                window.jQuery = _jQuery;
            }

            // 返回的是当前库的jq方法
            return jQuery;
        },

        // Is the DOM ready to be used? Set to true once it occurs.、
        // 标记 dom是否加载完毕
        isReady: false,

        // A counter to track how many items to wait for before
        // the ready event fires. See #6781
        // 调用holdReady的次数
        readyWait: 1,

        // Hold (or release) the ready event
        // 推迟dom加载事件的触发
        holdReady: function( hold ) {
            if ( hold ) {
                // 传true就会把计数器加1
                jQuery.readyWait++;
            } else {
                // 传false调用ready 会把计数器减1
                jQuery.ready( true );
            }
        },

        // Handle when the DOM is ready
        ready: function( wait ) {

            // Abort if there are pending holds or we're already ready
            // 只有hold的时候 才传true   把标记减1  如果不为0 就直接返回
            // hold不为true的时候 检查isReady标记 不能重复调用
            if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
                return;
            }

            // Remember that the DOM is ready
            // 设置加载完成的标记位
            jQuery.isReady = true;

            // If a normal DOM Ready event fired, decrement, and wait if need be
            if ( wait !== true && --jQuery.readyWait > 0 ) {
                return;
            }

            // If there are functions bound, to execute
            // 触发加载完成的回调 回调中的this是document   jQuery当做参数
            readyList.resolveWith( document, [ jQuery ] );

            // Trigger any bound ready events
            // $(document).on('ready', function(){}) 的触发
            if ( jQuery.fn.trigger ) {
                jQuery( document ).trigger("ready").off("ready");
            }
        },

        // See test/unit/core.js for details concerning isFunction.
        // Since version 1.3, DOM methods and functions like alert
        // aren't supported. They return false on IE (#2968).
        // 是否是一个方法
        isFunction: function( obj ) {
            return jQuery.type(obj) === "function";
        },

        // 是否是一个数组
        isArray: Array.isArray,

        // 是否是window对象  window.window === window
        isWindow: function( obj ) {
            return obj != null && obj === obj.window;
        },

        // 是否是一个数字类型
        isNumeric: function( obj ) {
            return !isNaN( parseFloat(obj) ) && isFinite( obj );
        },

        // 判断数据类型
        type: function( obj ) {
            // 如果是null undefined 直接返回一个字符串 "null"  "undefined"
            if ( obj == null ) {
                return String( obj );
            }
            // Support: Safari <= 5.1 (functionish RegExp)
            // {}.toString.call(obj)  从class2type中取值
            return typeof obj === "object" || typeof obj === "function" ?
                class2type[ core_toString.call(obj) ] || "object" :
                typeof obj;
        },

        // 判断是否是一个对象
        isPlainObject: function( obj ) {
            // Not plain objects:
            // - Any object or value whose internal [[Class]] property is not "[object Object]"
            // - DOM nodes
            // - window
            // type返回的不是object 或者 是个dom对象 或者 是window   直接返回false
            if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
                return false;
            }

            // Support: Firefox <20
            // The try/catch suppresses exceptions thrown when attempting to access
            // the "constructor" property of certain host objects, ie. |window.location|
            // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
            //
            try {
                // 有构造函数 构造函数的原型没有isPrototypeOf
                // isPrototypeOf 只有Object.prototype下才有
                if ( obj.constructor &&
                    !core_hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
                    return false;
                }
            } catch ( e ) {
                return false;
            }

            // If the function hasn't returned already, we're confident that
            // |obj| is a plain object, created by {} or constructed with new Object
            return true;
        },

        // 是否是一个空对象
        isEmptyObject: function( obj ) {
            var name;
            for ( name in obj ) {
                return false;
            }
            return true;
        },

        // 抛出一个错误
        error: function( msg ) {
            throw new Error( msg );
        },

        // data: string of html 字符串
        // context (optional): If specified, the fragment will be created in this context, defaults to document
        // keepScripts (optional): If true, will include scripts passed in the html string
        // 字符串转换成dom
        parseHTML: function( data, context, keepScripts ) {
            // 没有data 或者 不为string 返回null
            if ( !data || typeof data !== "string" ) {
                return null;
            }
            // 有可能不传上下文 直接传keepScripts
            // 修正参数位置
            if ( typeof context === "boolean" ) {
                keepScripts = context;
                context = false;
            }
            // 上下文默认document
            context = context || document;

            // 判断外层是否是由一个标签包裹 不是多个标签并列的
            var parsed = rsingleTag.exec( data ),
                // js存放的数组
                scripts = !keepScripts && [];

            // Single tag
            // 单标签的时候 直接创建一个元素 直接返回
            if ( parsed ) {
                return [ context.createElement( parsed[1] ) ];
            }

            // 多标签 创建dom
            parsed = jQuery.buildFragment( [ data ], context, scripts );

            // 通过buildFragment传入的scripts参数 把script标签元素放在了这个数组中
            if ( scripts ) {
                // 通过选择器删除
                jQuery( scripts ).remove();
            }

            // 转成数组返回
            return jQuery.merge( [], parsed.childNodes );
        },

        // 字符串转对象
        parseJSON: JSON.parse,

        // Cross-browser xml parsing
        // 字符串转换成xml
        parseXML: function( data ) {
            var xml, tmp;
            // 没有data 或者 不为string 返回null
            if ( !data || typeof data !== "string" ) {
                return null;
            }

            // Support: IE9
            try {
                // 创建一个解析器
                tmp = new DOMParser();
                // 调用方法转换成xml对象
                xml = tmp.parseFromString( data , "text/xml" );
            } catch ( e ) {
                // 转换出错
                xml = undefined;
            }

            // 解析失败的时候 直接抛出异常
            if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
                jQuery.error( "Invalid XML: " + data );
            }
            return xml;
        },

        // 空实现的函数
        noop: function() {},

        // Evaluates a script in a global context
        // 解析js
        globalEval: function( code ) {
            var script,
                indirect = eval;
            // eval 是一个关键字 也是window下的属性 表现不同

            // 除去前后空格
            code = jQuery.trim( code );

            // 不为空
            if ( code ) {
                // If the code includes a valid, prologue position
                // strict mode pragma, execute code by injecting a
                // script tag into the document.
                if ( code.indexOf("use strict") === 1 ) {
                    // 严格模式
                    // 创建一个script标签 内容是code 添加到head中 执行后再移除script标签
                    script = document.createElement("script");
                    script.text = code;
                    document.head.appendChild( script ).parentNode.removeChild( script );
                } else {
                    // 非严格模式
                    // Otherwise, avoid the DOM node creation, insertion
                    // and removal by using an indirect global eval
                    // 用eval执行
                    indirect( code );
                }
            }
        },

        // Convert dashed to camelCase; used by the css and data modules
        // Microsoft forgot to hump their vendor prefix (#9572)
        // 转驼峰
        camelCase: function( string ) {
            return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
        },

        // dom节点名称 是否是传入的 大小写不敏感  这中命名......
        nodeName: function( elem, name ) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        },

        // 数组 类数组 对象 遍历
        // args is for internal usage only
        // obj 要遍历的对象
        // callback 遍历到每一项的时候调用
        // args 内部使用
        each: function( obj, callback, args ) {
            var value,
                i = 0,
                length = obj.length,
                // 是否是数组
                isArray = isArraylike( obj );

            if ( args ) {
                // 内部使用的时候 有args
                if ( isArray ) {
                    for ( ; i < length; i++ ) {
                        // args 是传入每个回调执行的参数
                        value = callback.apply( obj[ i ], args );

                        if ( value === false ) {
                            break;
                        }
                    }
                } else {
                    for ( i in obj ) {
                        value = callback.apply( obj[ i ], args );

                        if ( value === false ) {
                            break;
                        }
                    }
                }

                // A special, fast, case for the most common use of each
            } else {
                if ( isArray ) {
                    // 是一个数组、类数组的时候 for循环调用 每个回调 如果回调有返回值false 终止循环
                    for ( ; i < length; i++ ) {
                        value = callback.call( obj[ i ], i, obj[ i ] );

                        if ( value === false ) {
                            break;
                        }
                    }
                } else {
                    // for in 遍历对象 每个回调 如果有返回值false 终止循环
                    for ( i in obj ) {
                        value = callback.call( obj[ i ], i, obj[ i ] );

                        if ( value === false ) {
                            break;
                        }
                    }
                }
            }

            return obj;
        },

        // 去除字符串前后空格
        trim: function( text ) {
            return text == null ? "" : core_trim.call( text );
        },

        // results is for internal usage only
        // 对象 字符串 数字 类数组 转成数组
        makeArray: function( arr, results ) {
            // results内部使用  默认空数组
            var ret = results || [];

            // 不为空判断
            if ( arr != null ) {
                // 是否是数组
                if ( isArraylike( Object(arr) ) ) {
                    // 调用merge 合并到ret上
                    jQuery.merge( ret,
                        typeof arr === "string" ?
                            [ arr ] : arr
                    );
                } else {
                    // 非数组就直接添加到ret上
                    core_push.call( ret, arr );
                }
            }

            return ret;
        },

        // 某个元素是否存在 这个数组中  返回索引
        // i 开始索引
        inArray: function( elem, arr, i ) {
            return arr == null ? -1 : core_indexOf.call( arr, elem, i );
        },

        // 合并
        merge: function( first, second ) {
            var l = second.length,
                i = first.length,
                j = 0;

            if ( typeof l === "number" ) {
                // 遍历 second的属性添加到first上
                for ( ; j < l; j++ ) {
                    first[ i++ ] = second[ j ];
                }
            } else {
                // second没有length属性 但是key 0, 1, 2, 有值
                while ( second[j] !== undefined ) {
                    first[ i++ ] = second[ j++ ];
                }
            }

            // 改变长度
            first.length = i;

            return first;
        },

        // 过滤
        grep: function( elems, callback, inv ) {
            var retVal,
                // 默认空数组 最终要返回ret
                ret = [],
                i = 0,
                // 要遍历的数组长度
                length = elems.length;
            // 转成boolean  有的时候希望true添加  有的时候希望false添加
            inv = !!inv;

            // Go through the array, only saving the items
            // that pass the validator function
            // 遍历每一项
            for ( ; i < length; i++ ) {
                // 调用回调 把返回值转成boolean
                retVal = !!callback( elems[ i ], i );
                // 如果 和传入的inv不一致 就添加到结果中
                if ( inv !== retVal ) {
                    ret.push( elems[ i ] );
                }
            }

            return ret;
        },

        // arg is for internal usage only
        // 映射生成新数组
        // arg和 each的arg类似
        map: function( elems, callback, arg ) {
            var value,
                i = 0,
                length = elems.length,
                // 是否是数组
                isArray = isArraylike( elems ),
                ret = [];

            // Go through the array, translating each of the items to their
            if ( isArray ) {
                for ( ; i < length; i++ ) {
                    // 调用回调 获得返回值
                    value = callback( elems[ i ], i, arg );

                    // 返回值不为空 就添加到新数组中
                    if ( value != null ) {
                        ret[ ret.length ] = value;
                    }
                }

                // Go through every key on the object,
            } else {
                // 对象for in 遍历
                for ( i in elems ) {
                    value = callback( elems[ i ], i, arg );

                    if ( value != null ) {
                        ret[ ret.length ] = value;
                    }
                }
            }

            // Flatten any nested arrays
            // 拼接为啥  二维数组拍平
            return core_concat.apply( [], ret );
        },

        // A global GUID counter for objects
        // 唯一标识符 累加的 生成id
        guid: 1,

        // Bind a function to a context, optionally partially applying any
        // arguments.
        // 代理 改变this指向
        proxy: function( fn, context ) {
            // fn要改变的函数
            // 要把fn的上下文改变成context
            var tmp, args, proxy;

            // 如果上下文是字符串 另一种写法
            if ( typeof context === "string" ) {
                // 从对象中取得这个值
                tmp = fn[ context ];
                // fn当成上下文
                context = fn;
                // 把这个值 当成fn参数
                fn = tmp;
            }

            // Quick check to determine if target is callable, in the spec
            // this throws a TypeError, but we will just return undefined.
            // 如果fn不是函数 就直接返回
            if ( !jQuery.isFunction( fn ) ) {
                return undefined;
            }

            // Simulated bind
            // 把第二个以后的参数 当成调用改变this指向之后的函数调用的参数
            args = core_slice.call( arguments, 2 );
            // 创建函数
            proxy = function() {
                // 调用apply 改变了this指向
                // arguments 是调用proxy传入的参数 和 外层第二个以后的参数合并 作为参数
                return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
            };

            // Set the guid of unique handler to the same of original handler, so it can be removed
            // 唯一标识 ++
            proxy.guid = fn.guid = fn.guid || jQuery.guid++;

            return proxy;
        },

        // Multifunctional method to get and set values of a collection
        // The value/s can optionally be executed if it's a function
        // 值操作 内部调用
        // elems要操作的目标
        // fn具体操作 回调
        // key 要设置的键
        // value 要设置的值
        // chainable true是设置 false是获取
        // emptyGet
        // raw
        access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
            var i = 0,
                length = elems.length,
                // key是否为空
                bulk = key == null;

            // Sets many values
            if ( jQuery.type( key ) === "object" ) {
                // key如果是个对象
                // 就是要设置多个值
                chainable = true;
                // 遍历这个key
                for ( i in key ) {
                    // 递归设置
                    jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
                }

                // Sets one value
            } else if ( value !== undefined ) {
                // 有value 就是要设置
                chainable = true;

                // 不是函数 就设置raw
                if ( !jQuery.isFunction( value ) ) {
                    raw = true;
                }

                // key为空的时候
                if ( bulk ) {
                    // Bulk operations run against the entire set
                    if ( raw ) {
                        // 执行回调
                        fn.call( elems, value );
                        fn = null;

                        // ...except when executing function values
                    } else {
                        // value 是个函数
                        bulk = fn;
                        fn = function( elem, key, value ) {
                            // 调用 改变上下文
                            return bulk.call( jQuery( elem ), value );
                        };
                    }
                }

                if ( fn ) {
                    // 遍历所有属性执行回调
                    for ( ; i < length; i++ ) {
                        fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
                    }
                }
            }

            return chainable ?
                // 返回本身 可以链式调用
                elems :

                // Gets
                bulk ?
                    // 没有key值 就返回回调的值
                    fn.call( elems ) :
                    // 判断长度 执行回调
                    length ? fn( elems[0], key ) : emptyGet;
        },

        // 获取当前时间
        now: Date.now,

        // A method for quickly swapping in/out CSS properties to get correct calculations.
        // Note: this method belongs to the css module but it's needed here for the support module.
        // If support gets modularized, this method should be moved back to the css module.
        // css交换
        swap: function( elem, options, callback, args ) {
            var ret, name,
                // 存旧样式的对象
                old = {};

            // Remember the old values, and insert the new ones
            // 遍历所有要改变的新样式对象
            for ( name in options ) {
                // 把现有的存在old上缓存一下
                old[ name ] = elem.style[ name ];
                // 把新的设置要dom元素上
                elem.style[ name ] = options[ name ];
            }

            // 执行回调 获得返回值
            ret = callback.apply( elem, args || [] );

            // Revert the old values
            // 遍历新样式 为了获得上次改变了哪些键
            for ( name in options ) {
                // 把旧的取出来 设置到dom元素上
                elem.style[ name ] = old[ name ];
            }

            return ret;
        }
    });

    // dom加载完成的时候都会调用jQuery.ready()
    jQuery.ready.promise = function( obj ) {
        // 第一次为空
        if ( !readyList ) {

            // 创建一个延迟对象
            readyList = jQuery.Deferred();

            // Catch cases where $(document).ready() is called after the browser event has already occurred.
            // we once tried to use readyState "interactive" here, but it caused issues like the one
            // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
            // 如果已经加载完成了
            if ( document.readyState === "complete" ) {
                // Handle it asynchronously to allow scripts the opportunity to delay ready
                // 直接调用jQuery.ready
                setTimeout( jQuery.ready );

            } else {

                // Use the handy event callback
                // 添加监听 completed
                document.addEventListener( "DOMContentLoaded", completed, false );

                // A fallback to window.onload, that will always work
                // 添加监听 completed
                window.addEventListener( "load", completed, false );

            //    在completed会销毁这两个监听 也就是会触发一次completed
            }
        }
        return readyList.promise( obj );
    };

// Populate the class2type map
//    往class2type中添加数据 相当于一个map 每次直接取值
    jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    });

    // 是否是类数组
    function isArraylike( obj ) {
        var length = obj.length,
            type = jQuery.type( obj );

        // 是window对象 直接返回false
        if ( jQuery.isWindow( obj ) ) {
            return false;
        }

        // nodeType为1 元素节点 并且有length属性  返回true
        if ( obj.nodeType === 1 && length ) {
            return true;
        }

        // 是真实数组
        // 不是一个方法 有合法的length属性
        return type === "array" || type !== "function" &&
            ( length === 0 ||
                typeof length === "number" && length > 0 && ( length - 1 ) in obj );
    }

// All jQuery objects should point back to these
//    根节点
    rootjQuery = jQuery(document);
    /*!
 * Sizzle CSS Selector Engine v1.9.4-pre
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-06-03
 */
    // todo sizzle选择器
    (function( window, undefined ) {

        var i,
            support,
            cachedruns,
            Expr,
            getText,
            isXML,
            compile,
            outermostContext,
            sortInput,

            // Local document vars
            setDocument,
            document,
            docElem,
            documentIsHTML,
            rbuggyQSA,
            rbuggyMatches,
            matches,
            contains,

            // Instance-specific data
            expando = "sizzle" + -(new Date()),
            preferredDoc = window.document,
            dirruns = 0,
            done = 0,
            classCache = createCache(),
            tokenCache = createCache(),
            compilerCache = createCache(),
            hasDuplicate = false,
            sortOrder = function( a, b ) {
                if ( a === b ) {
                    hasDuplicate = true;
                    return 0;
                }
                return 0;
            },

            // General-purpose constants
            strundefined = typeof undefined,
            MAX_NEGATIVE = 1 << 31,

            // Instance methods
            hasOwn = ({}).hasOwnProperty,
            arr = [],
            pop = arr.pop,
            push_native = arr.push,
            push = arr.push,
            slice = arr.slice,
            // Use a stripped-down indexOf if we can't use a native one
            indexOf = arr.indexOf || function( elem ) {
                var i = 0,
                    len = this.length;
                for ( ; i < len; i++ ) {
                    if ( this[i] === elem ) {
                        return i;
                    }
                }
                return -1;
            },

            booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

            // Regular expressions

            // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
            whitespace = "[\\x20\\t\\r\\n\\f]",
            // http://www.w3.org/TR/css3-syntax/#characters
            characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

            // Loosely modeled on CSS identifier characters
            // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
            // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
            identifier = characterEncoding.replace( "w", "w#" ),

            // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
            attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
                "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

            // Prefer arguments quoted,
            //   then not containing pseudos/brackets,
            //   then attribute selectors/non-parenthetical expressions,
            //   then anything else
            // These preferences are here to reduce the number of selectors
            //   needing tokenize in the PSEUDO preFilter
            pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

            // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
            rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

            rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
            rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

            rsibling = new RegExp( whitespace + "*[+~]" ),
            rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),

            rpseudo = new RegExp( pseudos ),
            ridentifier = new RegExp( "^" + identifier + "$" ),

            matchExpr = {
                "ID": new RegExp( "^#(" + characterEncoding + ")" ),
                "CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
                "TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
                "ATTR": new RegExp( "^" + attributes ),
                "PSEUDO": new RegExp( "^" + pseudos ),
                "CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
                    "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
                    "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
                "bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
                // For use in libraries implementing .is()
                // We use this for POS matching in `select`
                "needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                    whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
            },

            rnative = /^[^{]+\{\s*\[native \w/,

            // Easily-parseable/retrievable ID or TAG or CLASS selectors
            rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

            rinputs = /^(?:input|select|textarea|button)$/i,
            rheader = /^h\d$/i,

            rescape = /'|\\/g,

            // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
            runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
            funescape = function( _, escaped, escapedWhitespace ) {
                var high = "0x" + escaped - 0x10000;
                // NaN means non-codepoint
                // Support: Firefox
                // Workaround erroneous numeric interpretation of +"0x"
                return high !== high || escapedWhitespace ?
                    escaped :
                    // BMP codepoint
                    high < 0 ?
                        String.fromCharCode( high + 0x10000 ) :
                        // Supplemental Plane codepoint (surrogate pair)
                        String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
            };

// Optimize for push.apply( _, NodeList )
        try {
            push.apply(
                (arr = slice.call( preferredDoc.childNodes )),
                preferredDoc.childNodes
            );
            // Support: Android<4.0
            // Detect silently failing push.apply
            arr[ preferredDoc.childNodes.length ].nodeType;
        } catch ( e ) {
            push = { apply: arr.length ?

                    // Leverage slice if possible
                    function( target, els ) {
                        push_native.apply( target, slice.call(els) );
                    } :

                    // Support: IE<9
                    // Otherwise append directly
                    function( target, els ) {
                        var j = target.length,
                            i = 0;
                        // Can't trust NodeList.length
                        while ( (target[j++] = els[i++]) ) {}
                        target.length = j - 1;
                    }
            };
        }

        function Sizzle( selector, context, results, seed ) {
            var match, elem, m, nodeType,
                // QSA vars
                i, groups, old, nid, newContext, newSelector;

            if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
                setDocument( context );
            }

            context = context || document;
            results = results || [];

            if ( !selector || typeof selector !== "string" ) {
                return results;
            }

            if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
                return [];
            }

            if ( documentIsHTML && !seed ) {

                // Shortcuts
                if ( (match = rquickExpr.exec( selector )) ) {
                    // Speed-up: Sizzle("#ID")
                    if ( (m = match[1]) ) {
                        if ( nodeType === 9 ) {
                            elem = context.getElementById( m );
                            // Check parentNode to catch when Blackberry 4.6 returns
                            // nodes that are no longer in the document #6963
                            if ( elem && elem.parentNode ) {
                                // Handle the case where IE, Opera, and Webkit return items
                                // by name instead of ID
                                if ( elem.id === m ) {
                                    results.push( elem );
                                    return results;
                                }
                            } else {
                                return results;
                            }
                        } else {
                            // Context is not a document
                            if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
                                contains( context, elem ) && elem.id === m ) {
                                results.push( elem );
                                return results;
                            }
                        }

                        // Speed-up: Sizzle("TAG")
                    } else if ( match[2] ) {
                        push.apply( results, context.getElementsByTagName( selector ) );
                        return results;

                        // Speed-up: Sizzle(".CLASS")
                    } else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
                        push.apply( results, context.getElementsByClassName( m ) );
                        return results;
                    }
                }

                // QSA path
                if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
                    nid = old = expando;
                    newContext = context;
                    newSelector = nodeType === 9 && selector;

                    // qSA works strangely on Element-rooted queries
                    // We can work around this by specifying an extra ID on the root
                    // and working up from there (Thanks to Andrew Dupont for the technique)
                    // IE 8 doesn't work on object elements
                    if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
                        groups = tokenize( selector );

                        if ( (old = context.getAttribute("id")) ) {
                            nid = old.replace( rescape, "\\$&" );
                        } else {
                            context.setAttribute( "id", nid );
                        }
                        nid = "[id='" + nid + "'] ";

                        i = groups.length;
                        while ( i-- ) {
                            groups[i] = nid + toSelector( groups[i] );
                        }
                        newContext = rsibling.test( selector ) && context.parentNode || context;
                        newSelector = groups.join(",");
                    }

                    if ( newSelector ) {
                        try {
                            push.apply( results,
                                newContext.querySelectorAll( newSelector )
                            );
                            return results;
                        } catch(qsaError) {
                        } finally {
                            if ( !old ) {
                                context.removeAttribute("id");
                            }
                        }
                    }
                }
            }

            // All others
            return select( selector.replace( rtrim, "$1" ), context, results, seed );
        }

        /**
         * Create key-value caches of limited size
         * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
         *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
         *	deleting the oldest entry
         */
        function createCache() {
            var keys = [];

            function cache( key, value ) {
                // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
                if ( keys.push( key += " " ) > Expr.cacheLength ) {
                    // Only keep the most recent entries
                    delete cache[ keys.shift() ];
                }
                return (cache[ key ] = value);
            }
            return cache;
        }

        /**
         * Mark a function for special use by Sizzle
         * @param {Function} fn The function to mark
         */
        function markFunction( fn ) {
            fn[ expando ] = true;
            return fn;
        }

        /**
         * Support testing using an element
         * @param {Function} fn Passed the created div and expects a boolean result
         */
        function assert( fn ) {
            var div = document.createElement("div");

            try {
                return !!fn( div );
            } catch (e) {
                return false;
            } finally {
                // Remove from its parent by default
                if ( div.parentNode ) {
                    div.parentNode.removeChild( div );
                }
                // release memory in IE
                div = null;
            }
        }

        /**
         * Adds the same handler for all of the specified attrs
         * @param {String} attrs Pipe-separated list of attributes
         * @param {Function} handler The method that will be applied
         */
        function addHandle( attrs, handler ) {
            var arr = attrs.split("|"),
                i = attrs.length;

            while ( i-- ) {
                Expr.attrHandle[ arr[i] ] = handler;
            }
        }

        /**
         * Checks document order of two siblings
         * @param {Element} a
         * @param {Element} b
         * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
         */
        function siblingCheck( a, b ) {
            var cur = b && a,
                diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
                    ( ~b.sourceIndex || MAX_NEGATIVE ) -
                    ( ~a.sourceIndex || MAX_NEGATIVE );

            // Use IE sourceIndex if available on both nodes
            if ( diff ) {
                return diff;
            }

            // Check if b follows a
            if ( cur ) {
                while ( (cur = cur.nextSibling) ) {
                    if ( cur === b ) {
                        return -1;
                    }
                }
            }

            return a ? 1 : -1;
        }

        /**
         * Returns a function to use in pseudos for input types
         * @param {String} type
         */
        function createInputPseudo( type ) {
            return function( elem ) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && elem.type === type;
            };
        }

        /**
         * Returns a function to use in pseudos for buttons
         * @param {String} type
         */
        function createButtonPseudo( type ) {
            return function( elem ) {
                var name = elem.nodeName.toLowerCase();
                return (name === "input" || name === "button") && elem.type === type;
            };
        }

        /**
         * Returns a function to use in pseudos for positionals
         * @param {Function} fn
         */
        function createPositionalPseudo( fn ) {
            return markFunction(function( argument ) {
                argument = +argument;
                return markFunction(function( seed, matches ) {
                    var j,
                        matchIndexes = fn( [], seed.length, argument ),
                        i = matchIndexes.length;

                    // Match elements found at the specified indexes
                    while ( i-- ) {
                        if ( seed[ (j = matchIndexes[i]) ] ) {
                            seed[j] = !(matches[j] = seed[j]);
                        }
                    }
                });
            });
        }

        /**
         * Detect xml
         * @param {Element|Object} elem An element or a document
         */
        isXML = Sizzle.isXML = function( elem ) {
            // documentElement is verified for cases where it doesn't yet exist
            // (such as loading iframes in IE - #4833)
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        };

// Expose support vars for convenience
        support = Sizzle.support = {};

        /**
         * Sets document-related variables once based on the current document
         * @param {Element|Object} [doc] An element or document object to use to set the document
         * @returns {Object} Returns the current document
         */
        setDocument = Sizzle.setDocument = function( node ) {
            var doc = node ? node.ownerDocument || node : preferredDoc,
                parent = doc.defaultView;

            // If no document and documentElement is available, return
            if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
                return document;
            }

            // Set our document
            document = doc;
            docElem = doc.documentElement;

            // Support tests
            documentIsHTML = !isXML( doc );

            // Support: IE>8
            // If iframe document is assigned to "document" variable and if iframe has been reloaded,
            // IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
            // IE6-8 do not support the defaultView property so parent will be undefined
            if ( parent && parent.attachEvent && parent !== parent.top ) {
                parent.attachEvent( "onbeforeunload", function() {
                    setDocument();
                });
            }

            /* Attributes
	---------------------------------------------------------------------- */

            // Support: IE<8
            // Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
            support.attributes = assert(function( div ) {
                div.className = "i";
                return !div.getAttribute("className");
            });

            /* getElement(s)By*
	---------------------------------------------------------------------- */

            // Check if getElementsByTagName("*") returns only elements
            support.getElementsByTagName = assert(function( div ) {
                div.appendChild( doc.createComment("") );
                return !div.getElementsByTagName("*").length;
            });

            // Check if getElementsByClassName can be trusted
            support.getElementsByClassName = assert(function( div ) {
                div.innerHTML = "<div class='a'></div><div class='a i'></div>";

                // Support: Safari<4
                // Catch class over-caching
                div.firstChild.className = "i";
                // Support: Opera<10
                // Catch gEBCN failure to find non-leading classes
                return div.getElementsByClassName("i").length === 2;
            });

            // Support: IE<10
            // Check if getElementById returns elements by name
            // The broken getElementById methods don't pick up programatically-set names,
            // so use a roundabout getElementsByName test
            support.getById = assert(function( div ) {
                docElem.appendChild( div ).id = expando;
                return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
            });

            // ID find and filter
            if ( support.getById ) {
                Expr.find["ID"] = function( id, context ) {
                    if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
                        var m = context.getElementById( id );
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        return m && m.parentNode ? [m] : [];
                    }
                };
                Expr.filter["ID"] = function( id ) {
                    var attrId = id.replace( runescape, funescape );
                    return function( elem ) {
                        return elem.getAttribute("id") === attrId;
                    };
                };
            } else {
                // Support: IE6/7
                // getElementById is not reliable as a find shortcut
                delete Expr.find["ID"];

                Expr.filter["ID"] =  function( id ) {
                    var attrId = id.replace( runescape, funescape );
                    return function( elem ) {
                        var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                        return node && node.value === attrId;
                    };
                };
            }

            // Tag
            Expr.find["TAG"] = support.getElementsByTagName ?
                function( tag, context ) {
                    if ( typeof context.getElementsByTagName !== strundefined ) {
                        return context.getElementsByTagName( tag );
                    }
                } :
                function( tag, context ) {
                    var elem,
                        tmp = [],
                        i = 0,
                        results = context.getElementsByTagName( tag );

                    // Filter out possible comments
                    if ( tag === "*" ) {
                        while ( (elem = results[i++]) ) {
                            if ( elem.nodeType === 1 ) {
                                tmp.push( elem );
                            }
                        }

                        return tmp;
                    }
                    return results;
                };

            // Class
            Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
                if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
                    return context.getElementsByClassName( className );
                }
            };

            /* QSA/matchesSelector
	---------------------------------------------------------------------- */

            // QSA and matchesSelector support

            // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
            rbuggyMatches = [];

            // qSa(:focus) reports false when true (Chrome 21)
            // We allow this because of a bug in IE8/9 that throws an error
            // whenever `document.activeElement` is accessed on an iframe
            // So, we allow :focus to pass through QSA all the time to avoid the IE error
            // See http://bugs.jquery.com/ticket/13378
            rbuggyQSA = [];

            if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
                // Build QSA regex
                // Regex strategy adopted from Diego Perini
                assert(function( div ) {
                    // Select is set to empty string on purpose
                    // This is to test IE's treatment of not explicitly
                    // setting a boolean content attribute,
                    // since its presence should be enough
                    // http://bugs.jquery.com/ticket/12359
                    div.innerHTML = "<select><option selected=''></option></select>";

                    // Support: IE8
                    // Boolean attributes and "value" are not treated correctly
                    if ( !div.querySelectorAll("[selected]").length ) {
                        rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
                    }

                    // Webkit/Opera - :checked should return selected option elements
                    // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                    // IE8 throws error here and will not see later tests
                    if ( !div.querySelectorAll(":checked").length ) {
                        rbuggyQSA.push(":checked");
                    }
                });

                assert(function( div ) {

                    // Support: Opera 10-12/IE8
                    // ^= $= *= and empty values
                    // Should not select anything
                    // Support: Windows 8 Native Apps
                    // The type attribute is restricted during .innerHTML assignment
                    var input = doc.createElement("input");
                    input.setAttribute( "type", "hidden" );
                    div.appendChild( input ).setAttribute( "t", "" );

                    if ( div.querySelectorAll("[t^='']").length ) {
                        rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
                    }

                    // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
                    // IE8 throws error here and will not see later tests
                    if ( !div.querySelectorAll(":enabled").length ) {
                        rbuggyQSA.push( ":enabled", ":disabled" );
                    }

                    // Opera 10-11 does not throw on post-comma invalid pseudos
                    div.querySelectorAll("*,:x");
                    rbuggyQSA.push(",.*:");
                });
            }

            if ( (support.matchesSelector = rnative.test( (matches = docElem.webkitMatchesSelector ||
                docElem.mozMatchesSelector ||
                docElem.oMatchesSelector ||
                docElem.msMatchesSelector) )) ) {

                assert(function( div ) {
                    // Check to see if it's possible to do matchesSelector
                    // on a disconnected node (IE 9)
                    support.disconnectedMatch = matches.call( div, "div" );

                    // This should fail with an exception
                    // Gecko does not error, returns false instead
                    matches.call( div, "[s!='']:x" );
                    rbuggyMatches.push( "!=", pseudos );
                });
            }

            rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
            rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

            /* Contains
	---------------------------------------------------------------------- */

            // Element contains another
            // Purposefully does not implement inclusive descendent
            // As in, an element does not contain itself
            contains = rnative.test( docElem.contains ) || docElem.compareDocumentPosition ?
                function( a, b ) {
                    var adown = a.nodeType === 9 ? a.documentElement : a,
                        bup = b && b.parentNode;
                    return a === bup || !!( bup && bup.nodeType === 1 && (
                        adown.contains ?
                            adown.contains( bup ) :
                            a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
                    ));
                } :
                function( a, b ) {
                    if ( b ) {
                        while ( (b = b.parentNode) ) {
                            if ( b === a ) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

            /* Sorting
	---------------------------------------------------------------------- */

            // Document order sorting
            sortOrder = docElem.compareDocumentPosition ?
                function( a, b ) {

                    // Flag for duplicate removal
                    if ( a === b ) {
                        hasDuplicate = true;
                        return 0;
                    }

                    var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

                    if ( compare ) {
                        // Disconnected nodes
                        if ( compare & 1 ||
                            (!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

                            // Choose the first element that is related to our preferred document
                            if ( a === doc || contains(preferredDoc, a) ) {
                                return -1;
                            }
                            if ( b === doc || contains(preferredDoc, b) ) {
                                return 1;
                            }

                            // Maintain original order
                            return sortInput ?
                                ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
                                0;
                        }

                        return compare & 4 ? -1 : 1;
                    }

                    // Not directly comparable, sort on existence of method
                    return a.compareDocumentPosition ? -1 : 1;
                } :
                function( a, b ) {
                    var cur,
                        i = 0,
                        aup = a.parentNode,
                        bup = b.parentNode,
                        ap = [ a ],
                        bp = [ b ];

                    // Exit early if the nodes are identical
                    if ( a === b ) {
                        hasDuplicate = true;
                        return 0;

                        // Parentless nodes are either documents or disconnected
                    } else if ( !aup || !bup ) {
                        return a === doc ? -1 :
                            b === doc ? 1 :
                                aup ? -1 :
                                    bup ? 1 :
                                        sortInput ?
                                            ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
                                            0;

                        // If the nodes are siblings, we can do a quick check
                    } else if ( aup === bup ) {
                        return siblingCheck( a, b );
                    }

                    // Otherwise we need full lists of their ancestors for comparison
                    cur = a;
                    while ( (cur = cur.parentNode) ) {
                        ap.unshift( cur );
                    }
                    cur = b;
                    while ( (cur = cur.parentNode) ) {
                        bp.unshift( cur );
                    }

                    // Walk down the tree looking for a discrepancy
                    while ( ap[i] === bp[i] ) {
                        i++;
                    }

                    return i ?
                        // Do a sibling check if the nodes have a common ancestor
                        siblingCheck( ap[i], bp[i] ) :

                        // Otherwise nodes in our document sort first
                        ap[i] === preferredDoc ? -1 :
                            bp[i] === preferredDoc ? 1 :
                                0;
                };

            return doc;
        };

        Sizzle.matches = function( expr, elements ) {
            return Sizzle( expr, null, null, elements );
        };

        Sizzle.matchesSelector = function( elem, expr ) {
            // Set document vars if needed
            if ( ( elem.ownerDocument || elem ) !== document ) {
                setDocument( elem );
            }

            // Make sure that attribute selectors are quoted
            expr = expr.replace( rattributeQuotes, "='$1']" );

            if ( support.matchesSelector && documentIsHTML &&
                ( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
                ( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

                try {
                    var ret = matches.call( elem, expr );

                    // IE 9's matchesSelector returns false on disconnected nodes
                    if ( ret || support.disconnectedMatch ||
                        // As well, disconnected nodes are said to be in a document
                        // fragment in IE 9
                        elem.document && elem.document.nodeType !== 11 ) {
                        return ret;
                    }
                } catch(e) {}
            }

            return Sizzle( expr, document, null, [elem] ).length > 0;
        };

        Sizzle.contains = function( context, elem ) {
            // Set document vars if needed
            if ( ( context.ownerDocument || context ) !== document ) {
                setDocument( context );
            }
            return contains( context, elem );
        };

        Sizzle.attr = function( elem, name ) {
            // Set document vars if needed
            if ( ( elem.ownerDocument || elem ) !== document ) {
                setDocument( elem );
            }

            var fn = Expr.attrHandle[ name.toLowerCase() ],
                // Don't get fooled by Object.prototype properties (jQuery #13807)
                val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
                    fn( elem, name, !documentIsHTML ) :
                    undefined;

            return val === undefined ?
                support.attributes || !documentIsHTML ?
                    elem.getAttribute( name ) :
                    (val = elem.getAttributeNode(name)) && val.specified ?
                        val.value :
                        null :
                val;
        };

        Sizzle.error = function( msg ) {
            throw new Error( "Syntax error, unrecognized expression: " + msg );
        };

        /**
         * Document sorting and removing duplicates
         * @param {ArrayLike} results
         */
        Sizzle.uniqueSort = function( results ) {
            var elem,
                duplicates = [],
                j = 0,
                i = 0;

            // Unless we *know* we can detect duplicates, assume their presence
            hasDuplicate = !support.detectDuplicates;
            sortInput = !support.sortStable && results.slice( 0 );
            results.sort( sortOrder );

            if ( hasDuplicate ) {
                while ( (elem = results[i++]) ) {
                    if ( elem === results[ i ] ) {
                        j = duplicates.push( i );
                    }
                }
                while ( j-- ) {
                    results.splice( duplicates[ j ], 1 );
                }
            }

            return results;
        };

        /**
         * Utility function for retrieving the text value of an array of DOM nodes
         * @param {Array|Element} elem
         */
        getText = Sizzle.getText = function( elem ) {
            var node,
                ret = "",
                i = 0,
                nodeType = elem.nodeType;

            if ( !nodeType ) {
                // If no nodeType, this is expected to be an array
                for ( ; (node = elem[i]); i++ ) {
                    // Do not traverse comment nodes
                    ret += getText( node );
                }
            } else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
                // Use textContent for elements
                // innerText usage removed for consistency of new lines (see #11153)
                if ( typeof elem.textContent === "string" ) {
                    return elem.textContent;
                } else {
                    // Traverse its children
                    for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                        ret += getText( elem );
                    }
                }
            } else if ( nodeType === 3 || nodeType === 4 ) {
                return elem.nodeValue;
            }
            // Do not include comment or processing instruction nodes

            return ret;
        };

        Expr = Sizzle.selectors = {

            // Can be adjusted by the user
            cacheLength: 50,

            createPseudo: markFunction,

            match: matchExpr,

            attrHandle: {},

            find: {},

            relative: {
                ">": { dir: "parentNode", first: true },
                " ": { dir: "parentNode" },
                "+": { dir: "previousSibling", first: true },
                "~": { dir: "previousSibling" }
            },

            preFilter: {
                "ATTR": function( match ) {
                    match[1] = match[1].replace( runescape, funescape );

                    // Move the given value to match[3] whether quoted or unquoted
                    match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

                    if ( match[2] === "~=" ) {
                        match[3] = " " + match[3] + " ";
                    }

                    return match.slice( 0, 4 );
                },

                "CHILD": function( match ) {
                    /* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
                    match[1] = match[1].toLowerCase();

                    if ( match[1].slice( 0, 3 ) === "nth" ) {
                        // nth-* requires argument
                        if ( !match[3] ) {
                            Sizzle.error( match[0] );
                        }

                        // numeric x and y parameters for Expr.filter.CHILD
                        // remember that false/true cast respectively to 0/1
                        match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
                        match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

                        // other types prohibit arguments
                    } else if ( match[3] ) {
                        Sizzle.error( match[0] );
                    }

                    return match;
                },

                "PSEUDO": function( match ) {
                    var excess,
                        unquoted = !match[5] && match[2];

                    if ( matchExpr["CHILD"].test( match[0] ) ) {
                        return null;
                    }

                    // Accept quoted arguments as-is
                    if ( match[3] && match[4] !== undefined ) {
                        match[2] = match[4];

                        // Strip excess characters from unquoted arguments
                    } else if ( unquoted && rpseudo.test( unquoted ) &&
                        // Get excess from tokenize (recursively)
                        (excess = tokenize( unquoted, true )) &&
                        // advance to the next closing parenthesis
                        (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

                        // excess is a negative index
                        match[0] = match[0].slice( 0, excess );
                        match[2] = unquoted.slice( 0, excess );
                    }

                    // Return only captures needed by the pseudo filter method (type and argument)
                    return match.slice( 0, 3 );
                }
            },

            filter: {

                "TAG": function( nodeNameSelector ) {
                    var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
                    return nodeNameSelector === "*" ?
                        function() { return true; } :
                        function( elem ) {
                            return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                        };
                },

                "CLASS": function( className ) {
                    var pattern = classCache[ className + " " ];

                    return pattern ||
                        (pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
                        classCache( className, function( elem ) {
                            return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
                        });
                },

                "ATTR": function( name, operator, check ) {
                    return function( elem ) {
                        var result = Sizzle.attr( elem, name );

                        if ( result == null ) {
                            return operator === "!=";
                        }
                        if ( !operator ) {
                            return true;
                        }

                        result += "";

                        return operator === "=" ? result === check :
                            operator === "!=" ? result !== check :
                                operator === "^=" ? check && result.indexOf( check ) === 0 :
                                    operator === "*=" ? check && result.indexOf( check ) > -1 :
                                        operator === "$=" ? check && result.slice( -check.length ) === check :
                                            operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
                                                operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
                                                    false;
                    };
                },

                "CHILD": function( type, what, argument, first, last ) {
                    var simple = type.slice( 0, 3 ) !== "nth",
                        forward = type.slice( -4 ) !== "last",
                        ofType = what === "of-type";

                    return first === 1 && last === 0 ?

                        // Shortcut for :nth-*(n)
                        function( elem ) {
                            return !!elem.parentNode;
                        } :

                        function( elem, context, xml ) {
                            var cache, outerCache, node, diff, nodeIndex, start,
                                dir = simple !== forward ? "nextSibling" : "previousSibling",
                                parent = elem.parentNode,
                                name = ofType && elem.nodeName.toLowerCase(),
                                useCache = !xml && !ofType;

                            if ( parent ) {

                                // :(first|last|only)-(child|of-type)
                                if ( simple ) {
                                    while ( dir ) {
                                        node = elem;
                                        while ( (node = node[ dir ]) ) {
                                            if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
                                                return false;
                                            }
                                        }
                                        // Reverse direction for :only-* (if we haven't yet done so)
                                        start = dir = type === "only" && !start && "nextSibling";
                                    }
                                    return true;
                                }

                                start = [ forward ? parent.firstChild : parent.lastChild ];

                                // non-xml :nth-child(...) stores cache data on `parent`
                                if ( forward && useCache ) {
                                    // Seek `elem` from a previously-cached index
                                    outerCache = parent[ expando ] || (parent[ expando ] = {});
                                    cache = outerCache[ type ] || [];
                                    nodeIndex = cache[0] === dirruns && cache[1];
                                    diff = cache[0] === dirruns && cache[2];
                                    node = nodeIndex && parent.childNodes[ nodeIndex ];

                                    while ( (node = ++nodeIndex && node && node[ dir ] ||

                                        // Fallback to seeking `elem` from the start
                                        (diff = nodeIndex = 0) || start.pop()) ) {

                                        // When found, cache indexes on `parent` and break
                                        if ( node.nodeType === 1 && ++diff && node === elem ) {
                                            outerCache[ type ] = [ dirruns, nodeIndex, diff ];
                                            break;
                                        }
                                    }

                                    // Use previously-cached element index if available
                                } else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
                                    diff = cache[1];

                                    // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
                                } else {
                                    // Use the same loop as above to seek `elem` from the start
                                    while ( (node = ++nodeIndex && node && node[ dir ] ||
                                        (diff = nodeIndex = 0) || start.pop()) ) {

                                        if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
                                            // Cache the index of each encountered element
                                            if ( useCache ) {
                                                (node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
                                            }

                                            if ( node === elem ) {
                                                break;
                                            }
                                        }
                                    }
                                }

                                // Incorporate the offset, then check against cycle size
                                diff -= last;
                                return diff === first || ( diff % first === 0 && diff / first >= 0 );
                            }
                        };
                },

                "PSEUDO": function( pseudo, argument ) {
                    // pseudo-class names are case-insensitive
                    // http://www.w3.org/TR/selectors/#pseudo-classes
                    // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
                    // Remember that setFilters inherits from pseudos
                    var args,
                        fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
                            Sizzle.error( "unsupported pseudo: " + pseudo );

                    // The user may use createPseudo to indicate that
                    // arguments are needed to create the filter function
                    // just as Sizzle does
                    if ( fn[ expando ] ) {
                        return fn( argument );
                    }

                    // But maintain support for old signatures
                    if ( fn.length > 1 ) {
                        args = [ pseudo, pseudo, "", argument ];
                        return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
                            markFunction(function( seed, matches ) {
                                var idx,
                                    matched = fn( seed, argument ),
                                    i = matched.length;
                                while ( i-- ) {
                                    idx = indexOf.call( seed, matched[i] );
                                    seed[ idx ] = !( matches[ idx ] = matched[i] );
                                }
                            }) :
                            function( elem ) {
                                return fn( elem, 0, args );
                            };
                    }

                    return fn;
                }
            },

            pseudos: {
                // Potentially complex pseudos
                "not": markFunction(function( selector ) {
                    // Trim the selector passed to compile
                    // to avoid treating leading and trailing
                    // spaces as combinators
                    var input = [],
                        results = [],
                        matcher = compile( selector.replace( rtrim, "$1" ) );

                    return matcher[ expando ] ?
                        markFunction(function( seed, matches, context, xml ) {
                            var elem,
                                unmatched = matcher( seed, null, xml, [] ),
                                i = seed.length;

                            // Match elements unmatched by `matcher`
                            while ( i-- ) {
                                if ( (elem = unmatched[i]) ) {
                                    seed[i] = !(matches[i] = elem);
                                }
                            }
                        }) :
                        function( elem, context, xml ) {
                            input[0] = elem;
                            matcher( input, null, xml, results );
                            return !results.pop();
                        };
                }),

                "has": markFunction(function( selector ) {
                    return function( elem ) {
                        return Sizzle( selector, elem ).length > 0;
                    };
                }),

                "contains": markFunction(function( text ) {
                    return function( elem ) {
                        return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
                    };
                }),

                // "Whether an element is represented by a :lang() selector
                // is based solely on the element's language value
                // being equal to the identifier C,
                // or beginning with the identifier C immediately followed by "-".
                // The matching of C against the element's language value is performed case-insensitively.
                // The identifier C does not have to be a valid language name."
                // http://www.w3.org/TR/selectors/#lang-pseudo
                "lang": markFunction( function( lang ) {
                    // lang value must be a valid identifier
                    if ( !ridentifier.test(lang || "") ) {
                        Sizzle.error( "unsupported lang: " + lang );
                    }
                    lang = lang.replace( runescape, funescape ).toLowerCase();
                    return function( elem ) {
                        var elemLang;
                        do {
                            if ( (elemLang = documentIsHTML ?
                                elem.lang :
                                elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

                                elemLang = elemLang.toLowerCase();
                                return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
                            }
                        } while ( (elem = elem.parentNode) && elem.nodeType === 1 );
                        return false;
                    };
                }),

                // Miscellaneous
                "target": function( elem ) {
                    var hash = window.location && window.location.hash;
                    return hash && hash.slice( 1 ) === elem.id;
                },

                "root": function( elem ) {
                    return elem === docElem;
                },

                "focus": function( elem ) {
                    return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
                },

                // Boolean properties
                "enabled": function( elem ) {
                    return elem.disabled === false;
                },

                "disabled": function( elem ) {
                    return elem.disabled === true;
                },

                "checked": function( elem ) {
                    // In CSS3, :checked should return both checked and selected elements
                    // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                    var nodeName = elem.nodeName.toLowerCase();
                    return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
                },

                "selected": function( elem ) {
                    // Accessing this property makes selected-by-default
                    // options in Safari work properly
                    if ( elem.parentNode ) {
                        elem.parentNode.selectedIndex;
                    }

                    return elem.selected === true;
                },

                // Contents
                "empty": function( elem ) {
                    // http://www.w3.org/TR/selectors/#empty-pseudo
                    // :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
                    //   not comment, processing instructions, or others
                    // Thanks to Diego Perini for the nodeName shortcut
                    //   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
                    for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                        if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
                            return false;
                        }
                    }
                    return true;
                },

                "parent": function( elem ) {
                    return !Expr.pseudos["empty"]( elem );
                },

                // Element/input types
                "header": function( elem ) {
                    return rheader.test( elem.nodeName );
                },

                "input": function( elem ) {
                    return rinputs.test( elem.nodeName );
                },

                "button": function( elem ) {
                    var name = elem.nodeName.toLowerCase();
                    return name === "input" && elem.type === "button" || name === "button";
                },

                "text": function( elem ) {
                    var attr;
                    // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
                    // use getAttribute instead to test this case
                    return elem.nodeName.toLowerCase() === "input" &&
                        elem.type === "text" &&
                        ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
                },

                // Position-in-collection
                "first": createPositionalPseudo(function() {
                    return [ 0 ];
                }),

                "last": createPositionalPseudo(function( matchIndexes, length ) {
                    return [ length - 1 ];
                }),

                "eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
                    return [ argument < 0 ? argument + length : argument ];
                }),

                "even": createPositionalPseudo(function( matchIndexes, length ) {
                    var i = 0;
                    for ( ; i < length; i += 2 ) {
                        matchIndexes.push( i );
                    }
                    return matchIndexes;
                }),

                "odd": createPositionalPseudo(function( matchIndexes, length ) {
                    var i = 1;
                    for ( ; i < length; i += 2 ) {
                        matchIndexes.push( i );
                    }
                    return matchIndexes;
                }),

                "lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
                    var i = argument < 0 ? argument + length : argument;
                    for ( ; --i >= 0; ) {
                        matchIndexes.push( i );
                    }
                    return matchIndexes;
                }),

                "gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
                    var i = argument < 0 ? argument + length : argument;
                    for ( ; ++i < length; ) {
                        matchIndexes.push( i );
                    }
                    return matchIndexes;
                })
            }
        };

        Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
        for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
            Expr.pseudos[ i ] = createInputPseudo( i );
        }
        for ( i in { submit: true, reset: true } ) {
            Expr.pseudos[ i ] = createButtonPseudo( i );
        }

// Easy API for creating new setFilters
        function setFilters() {}
        setFilters.prototype = Expr.filters = Expr.pseudos;
        Expr.setFilters = new setFilters();

        function tokenize( selector, parseOnly ) {
            var matched, match, tokens, type,
                soFar, groups, preFilters,
                cached = tokenCache[ selector + " " ];

            if ( cached ) {
                return parseOnly ? 0 : cached.slice( 0 );
            }

            soFar = selector;
            groups = [];
            preFilters = Expr.preFilter;

            while ( soFar ) {

                // Comma and first run
                if ( !matched || (match = rcomma.exec( soFar )) ) {
                    if ( match ) {
                        // Don't consume trailing commas as valid
                        soFar = soFar.slice( match[0].length ) || soFar;
                    }
                    groups.push( tokens = [] );
                }

                matched = false;

                // Combinators
                if ( (match = rcombinators.exec( soFar )) ) {
                    matched = match.shift();
                    tokens.push({
                        value: matched,
                        // Cast descendant combinators to space
                        type: match[0].replace( rtrim, " " )
                    });
                    soFar = soFar.slice( matched.length );
                }

                // Filters
                for ( type in Expr.filter ) {
                    if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
                        (match = preFilters[ type ]( match ))) ) {
                        matched = match.shift();
                        tokens.push({
                            value: matched,
                            type: type,
                            matches: match
                        });
                        soFar = soFar.slice( matched.length );
                    }
                }

                if ( !matched ) {
                    break;
                }
            }

            // Return the length of the invalid excess
            // if we're just parsing
            // Otherwise, throw an error or return tokens
            return parseOnly ?
                soFar.length :
                soFar ?
                    Sizzle.error( selector ) :
                    // Cache the tokens
                    tokenCache( selector, groups ).slice( 0 );
        }

        function toSelector( tokens ) {
            var i = 0,
                len = tokens.length,
                selector = "";
            for ( ; i < len; i++ ) {
                selector += tokens[i].value;
            }
            return selector;
        }

        function addCombinator( matcher, combinator, base ) {
            var dir = combinator.dir,
                checkNonElements = base && dir === "parentNode",
                doneName = done++;

            return combinator.first ?
                // Check against closest ancestor/preceding element
                function( elem, context, xml ) {
                    while ( (elem = elem[ dir ]) ) {
                        if ( elem.nodeType === 1 || checkNonElements ) {
                            return matcher( elem, context, xml );
                        }
                    }
                } :

                // Check against all ancestor/preceding elements
                function( elem, context, xml ) {
                    var data, cache, outerCache,
                        dirkey = dirruns + " " + doneName;

                    // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
                    if ( xml ) {
                        while ( (elem = elem[ dir ]) ) {
                            if ( elem.nodeType === 1 || checkNonElements ) {
                                if ( matcher( elem, context, xml ) ) {
                                    return true;
                                }
                            }
                        }
                    } else {
                        while ( (elem = elem[ dir ]) ) {
                            if ( elem.nodeType === 1 || checkNonElements ) {
                                outerCache = elem[ expando ] || (elem[ expando ] = {});
                                if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
                                    if ( (data = cache[1]) === true || data === cachedruns ) {
                                        return data === true;
                                    }
                                } else {
                                    cache = outerCache[ dir ] = [ dirkey ];
                                    cache[1] = matcher( elem, context, xml ) || cachedruns;
                                    if ( cache[1] === true ) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                };
        }

        function elementMatcher( matchers ) {
            return matchers.length > 1 ?
                function( elem, context, xml ) {
                    var i = matchers.length;
                    while ( i-- ) {
                        if ( !matchers[i]( elem, context, xml ) ) {
                            return false;
                        }
                    }
                    return true;
                } :
                matchers[0];
        }

        function condense( unmatched, map, filter, context, xml ) {
            var elem,
                newUnmatched = [],
                i = 0,
                len = unmatched.length,
                mapped = map != null;

            for ( ; i < len; i++ ) {
                if ( (elem = unmatched[i]) ) {
                    if ( !filter || filter( elem, context, xml ) ) {
                        newUnmatched.push( elem );
                        if ( mapped ) {
                            map.push( i );
                        }
                    }
                }
            }

            return newUnmatched;
        }

        function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
            if ( postFilter && !postFilter[ expando ] ) {
                postFilter = setMatcher( postFilter );
            }
            if ( postFinder && !postFinder[ expando ] ) {
                postFinder = setMatcher( postFinder, postSelector );
            }
            return markFunction(function( seed, results, context, xml ) {
                var temp, i, elem,
                    preMap = [],
                    postMap = [],
                    preexisting = results.length,

                    // Get initial elements from seed or context
                    elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

                    // Prefilter to get matcher input, preserving a map for seed-results synchronization
                    matcherIn = preFilter && ( seed || !selector ) ?
                        condense( elems, preMap, preFilter, context, xml ) :
                        elems,

                    matcherOut = matcher ?
                        // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
                        postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

                            // ...intermediate processing is necessary
                            [] :

                            // ...otherwise use results directly
                            results :
                        matcherIn;

                // Find primary matches
                if ( matcher ) {
                    matcher( matcherIn, matcherOut, context, xml );
                }

                // Apply postFilter
                if ( postFilter ) {
                    temp = condense( matcherOut, postMap );
                    postFilter( temp, [], context, xml );

                    // Un-match failing elements by moving them back to matcherIn
                    i = temp.length;
                    while ( i-- ) {
                        if ( (elem = temp[i]) ) {
                            matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
                        }
                    }
                }

                if ( seed ) {
                    if ( postFinder || preFilter ) {
                        if ( postFinder ) {
                            // Get the final matcherOut by condensing this intermediate into postFinder contexts
                            temp = [];
                            i = matcherOut.length;
                            while ( i-- ) {
                                if ( (elem = matcherOut[i]) ) {
                                    // Restore matcherIn since elem is not yet a final match
                                    temp.push( (matcherIn[i] = elem) );
                                }
                            }
                            postFinder( null, (matcherOut = []), temp, xml );
                        }

                        // Move matched elements from seed to results to keep them synchronized
                        i = matcherOut.length;
                        while ( i-- ) {
                            if ( (elem = matcherOut[i]) &&
                                (temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

                                seed[temp] = !(results[temp] = elem);
                            }
                        }
                    }

                    // Add elements to results, through postFinder if defined
                } else {
                    matcherOut = condense(
                        matcherOut === results ?
                            matcherOut.splice( preexisting, matcherOut.length ) :
                            matcherOut
                    );
                    if ( postFinder ) {
                        postFinder( null, results, matcherOut, xml );
                    } else {
                        push.apply( results, matcherOut );
                    }
                }
            });
        }

        function matcherFromTokens( tokens ) {
            var checkContext, matcher, j,
                len = tokens.length,
                leadingRelative = Expr.relative[ tokens[0].type ],
                implicitRelative = leadingRelative || Expr.relative[" "],
                i = leadingRelative ? 1 : 0,

                // The foundational matcher ensures that elements are reachable from top-level context(s)
                matchContext = addCombinator( function( elem ) {
                    return elem === checkContext;
                }, implicitRelative, true ),
                matchAnyContext = addCombinator( function( elem ) {
                    return indexOf.call( checkContext, elem ) > -1;
                }, implicitRelative, true ),
                matchers = [ function( elem, context, xml ) {
                    return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
                        (checkContext = context).nodeType ?
                            matchContext( elem, context, xml ) :
                            matchAnyContext( elem, context, xml ) );
                } ];

            for ( ; i < len; i++ ) {
                if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
                    matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
                } else {
                    matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

                    // Return special upon seeing a positional matcher
                    if ( matcher[ expando ] ) {
                        // Find the next relative operator (if any) for proper handling
                        j = ++i;
                        for ( ; j < len; j++ ) {
                            if ( Expr.relative[ tokens[j].type ] ) {
                                break;
                            }
                        }
                        return setMatcher(
                            i > 1 && elementMatcher( matchers ),
                            i > 1 && toSelector(
                            // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                            tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
                            ).replace( rtrim, "$1" ),
                            matcher,
                            i < j && matcherFromTokens( tokens.slice( i, j ) ),
                            j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
                            j < len && toSelector( tokens )
                        );
                    }
                    matchers.push( matcher );
                }
            }

            return elementMatcher( matchers );
        }

        function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
            // A counter to specify which element is currently being matched
            var matcherCachedRuns = 0,
                bySet = setMatchers.length > 0,
                byElement = elementMatchers.length > 0,
                superMatcher = function( seed, context, xml, results, expandContext ) {
                    var elem, j, matcher,
                        setMatched = [],
                        matchedCount = 0,
                        i = "0",
                        unmatched = seed && [],
                        outermost = expandContext != null,
                        contextBackup = outermostContext,
                        // We must always have either seed elements or context
                        elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
                        // Use integer dirruns iff this is the outermost matcher
                        dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

                    if ( outermost ) {
                        outermostContext = context !== document && context;
                        cachedruns = matcherCachedRuns;
                    }

                    // Add elements passing elementMatchers directly to results
                    // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
                    for ( ; (elem = elems[i]) != null; i++ ) {
                        if ( byElement && elem ) {
                            j = 0;
                            while ( (matcher = elementMatchers[j++]) ) {
                                if ( matcher( elem, context, xml ) ) {
                                    results.push( elem );
                                    break;
                                }
                            }
                            if ( outermost ) {
                                dirruns = dirrunsUnique;
                                cachedruns = ++matcherCachedRuns;
                            }
                        }

                        // Track unmatched elements for set filters
                        if ( bySet ) {
                            // They will have gone through all possible matchers
                            if ( (elem = !matcher && elem) ) {
                                matchedCount--;
                            }

                            // Lengthen the array for every element, matched or not
                            if ( seed ) {
                                unmatched.push( elem );
                            }
                        }
                    }

                    // Apply set filters to unmatched elements
                    matchedCount += i;
                    if ( bySet && i !== matchedCount ) {
                        j = 0;
                        while ( (matcher = setMatchers[j++]) ) {
                            matcher( unmatched, setMatched, context, xml );
                        }

                        if ( seed ) {
                            // Reintegrate element matches to eliminate the need for sorting
                            if ( matchedCount > 0 ) {
                                while ( i-- ) {
                                    if ( !(unmatched[i] || setMatched[i]) ) {
                                        setMatched[i] = pop.call( results );
                                    }
                                }
                            }

                            // Discard index placeholder values to get only actual matches
                            setMatched = condense( setMatched );
                        }

                        // Add matches to results
                        push.apply( results, setMatched );

                        // Seedless set matches succeeding multiple successful matchers stipulate sorting
                        if ( outermost && !seed && setMatched.length > 0 &&
                            ( matchedCount + setMatchers.length ) > 1 ) {

                            Sizzle.uniqueSort( results );
                        }
                    }

                    // Override manipulation of globals by nested matchers
                    if ( outermost ) {
                        dirruns = dirrunsUnique;
                        outermostContext = contextBackup;
                    }

                    return unmatched;
                };

            return bySet ?
                markFunction( superMatcher ) :
                superMatcher;
        }

        compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
            var i,
                setMatchers = [],
                elementMatchers = [],
                cached = compilerCache[ selector + " " ];

            if ( !cached ) {
                // Generate a function of recursive functions that can be used to check each element
                if ( !group ) {
                    group = tokenize( selector );
                }
                i = group.length;
                while ( i-- ) {
                    cached = matcherFromTokens( group[i] );
                    if ( cached[ expando ] ) {
                        setMatchers.push( cached );
                    } else {
                        elementMatchers.push( cached );
                    }
                }

                // Cache the compiled function
                cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
            }
            return cached;
        };

        function multipleContexts( selector, contexts, results ) {
            var i = 0,
                len = contexts.length;
            for ( ; i < len; i++ ) {
                Sizzle( selector, contexts[i], results );
            }
            return results;
        }

        function select( selector, context, results, seed ) {
            var i, tokens, token, type, find,
                match = tokenize( selector );

            if ( !seed ) {
                // Try to minimize operations if there is only one group
                if ( match.length === 1 ) {

                    // Take a shortcut and set the context if the root selector is an ID
                    tokens = match[0] = match[0].slice( 0 );
                    if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
                        support.getById && context.nodeType === 9 && documentIsHTML &&
                        Expr.relative[ tokens[1].type ] ) {

                        context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
                        if ( !context ) {
                            return results;
                        }
                        selector = selector.slice( tokens.shift().value.length );
                    }

                    // Fetch a seed set for right-to-left matching
                    i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
                    while ( i-- ) {
                        token = tokens[i];

                        // Abort if we hit a combinator
                        if ( Expr.relative[ (type = token.type) ] ) {
                            break;
                        }
                        if ( (find = Expr.find[ type ]) ) {
                            // Search, expanding context for leading sibling combinators
                            if ( (seed = find(
                                token.matches[0].replace( runescape, funescape ),
                                rsibling.test( tokens[0].type ) && context.parentNode || context
                            )) ) {

                                // If seed is empty or no tokens remain, we can return early
                                tokens.splice( i, 1 );
                                selector = seed.length && toSelector( tokens );
                                if ( !selector ) {
                                    push.apply( results, seed );
                                    return results;
                                }

                                break;
                            }
                        }
                    }
                }
            }

            // Compile and execute a filtering function
            // Provide `match` to avoid retokenization if we modified the selector above
            compile( selector, match )(
                seed,
                context,
                !documentIsHTML,
                results,
                rsibling.test( selector )
            );
            return results;
        }

// One-time assignments

// Sort stability
        support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
        support.detectDuplicates = hasDuplicate;

// Initialize against the default document
        setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
        support.sortDetached = assert(function( div1 ) {
            // Should return 1, but returns 4 (following)
            return div1.compareDocumentPosition( document.createElement("div") ) & 1;
        });

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
        if ( !assert(function( div ) {
            div.innerHTML = "<a href='#'></a>";
            return div.firstChild.getAttribute("href") === "#" ;
        }) ) {
            addHandle( "type|href|height|width", function( elem, name, isXML ) {
                if ( !isXML ) {
                    return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
                }
            });
        }

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
        if ( !support.attributes || !assert(function( div ) {
            div.innerHTML = "<input/>";
            div.firstChild.setAttribute( "value", "" );
            return div.firstChild.getAttribute( "value" ) === "";
        }) ) {
            addHandle( "value", function( elem, name, isXML ) {
                if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
                    return elem.defaultValue;
                }
            });
        }

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
        if ( !assert(function( div ) {
            return div.getAttribute("disabled") == null;
        }) ) {
            addHandle( booleans, function( elem, name, isXML ) {
                var val;
                if ( !isXML ) {
                    return (val = elem.getAttributeNode( name )) && val.specified ?
                        val.value :
                        elem[ name ] === true ? name.toLowerCase() : null;
                }
            });
        }

        jQuery.find = Sizzle;
        jQuery.expr = Sizzle.selectors;
        jQuery.expr[":"] = jQuery.expr.pseudos;
        jQuery.unique = Sizzle.uniqueSort;
        jQuery.text = Sizzle.getText;
        jQuery.isXMLDoc = Sizzle.isXML;
        jQuery.contains = Sizzle.contains;


    })( window );
// String to Object options format cache
//    options的缓存
//    {"once memory": {once: true, memory: true}}
    var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
    function createOptions( options ) {
        // 创建一个空对象放在缓存中
        var object = optionsCache[ options ] = {};
        // options分隔之后遍历  对空对象赋值 也相当于对缓存中的对象赋值
        jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
            object[ flag ] = true;
        });
        return object;
    }

    /*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
    // todo 回调对象 函数的同一管理
    jQuery.Callbacks = function( options ) {
        // options字符串 可以单个也可以多个用空格分隔
        // once     fire多次调用的时候 只执行一次
        // memory   fire之后再add 直接调用
        // unique   add多次同样的方法 只触发一次
        // stopOnFalse      fire的时候 如果有方法返回值是false就不再执行后续的方法

        // Convert options from String-formatted to Object-formatted if needed
        // (we check in cache first)
        // 是否是字符串类型
        options = typeof options === "string" ?
            // 如果缓存中有直接拿  没有就调用createOptions创建
            ( optionsCache[ options ] || createOptions( options ) ) :
            // 默认值
            jQuery.extend( {}, options );

        var // Last fire value (for non-forgettable lists)
            memory,
            // Flag to know if list was already fired
            fired,
            // Flag to know if list is currently firing
            firing,
            // First callback to fire (used internally by add and fireWith)
            firingStart,
            // End of the loop when firing
            firingLength,
            // Index of currently firing callback (modified by remove if needed)
            firingIndex,
            // Actual callback list
            // 所有回调函数存储在list中
            list = [],
            // Stack of fire calls for repeatable lists
            stack = !options.once && [],
            // Fire callbacks
            // 触发
            fire = function( data ) {
                memory = options.memory && data;
                // 已经触发过一次
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                // 在回调过程中再次触发fire 延迟执行
                firing = true;
                for ( ; list && firingIndex < firingLength; firingIndex++ ) {
                    // 调用list中的函数 如果返回false并且是stopOnFalse模式 就直接break
                    if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
                        // 即使同时也是memory模式 下次再add也不会触发
                        memory = false; // To prevent further calls using add
                        break;
                    }
                }
                firing = false;
                if ( list ) {
                    if ( stack ) {
                        if ( stack.length ) {
                            fire( stack.shift() );
                        }
                    } else if ( memory ) {
                        list = [];
                    } else {
                        self.disable();
                    }
                }
            },
            // Actual Callbacks object
            self = {
                // Add a callback or a collection of callbacks to the list
                add: function() {
                    // list一定有 还判断个卵子
                    if ( list ) {
                        // First, we save the current length
                        // 当前的长度
                        var start = list.length;
                        // arguments可以有多个 调用一次add添加多个函数
                        (function add( args ) {
                            // 遍历所有的参数
                            jQuery.each( args, function( _, arg ) {
                                var type = jQuery.type( arg );
                                if ( type === "function" ) {
                                    // 如果是函数类型
                                    // 非unique模式  或者unique模式没有重复的
                                    if ( !options.unique || !self.has( arg ) ) {
                                        // 添加到list中
                                        list.push( arg );
                                    }
                                } else if ( arg && arg.length && type !== "string" ) {
                                    // Inspect recursively
                                    // 可以传入的是一个类数组、数组
                                    // 递归
                                    add( arg );
                                }
                            });
                        })( arguments );
                        // Do we need to add the callbacks to the
                        // current firing batch?
                        // 正在触发回调
                        if ( firing ) {
                            firingLength = list.length;
                            // With memory, if we're not firing then
                            // we should call right away
                        } else if ( memory ) {
                            // 如果是memory模式 就直接调用fire
                            firingStart = start;
                            fire( memory );
                        }
                    }
                    return this;
                },
                // Remove a callback from the list
                // 删除
                remove: function() {
                    if ( list ) {
                        // 可以传入多个参数
                        jQuery.each( arguments, function( _, arg ) {
                            var index;
                            // 遍历 remove传入的函数是否在list中
                            while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
                                // 删除当前索引的回调
                                list.splice( index, 1 );
                                // Handle firing indexes
                                if ( firing ) {
                                    if ( index <= firingLength ) {
                                        firingLength--;
                                    }
                                    if ( index <= firingIndex ) {
                                        firingIndex--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },
                // Check if a given callback is in the list.
                // If no argument is given, return whether or not list has callbacks attached.
                // 判断函数是否在list中
                has: function( fn ) {
                    // 传了fn 就取查找
                    // 没传fn 就判断list是否是空 或者 空数组
                    return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
                },
                // Remove all callbacks from the list
                empty: function() {
                    list = [];
                    firingLength = 0;
                    return this;
                },
                // Have the list do nothing anymore
                disable: function() {
                    list = stack = memory = undefined;
                    return this;
                },
                // Is it disabled?
                disabled: function() {
                    return !list;
                },
                // Lock the list in its current state
                lock: function() {
                    stack = undefined;
                    if ( !memory ) {
                        self.disable();
                    }
                    return this;
                },
                // Is it locked?
                locked: function() {
                    return !stack;
                },
                // Call all callbacks with the given context and arguments
                fireWith: function( context, args ) {
                    // fired是否已经触发过
                    if ( list && ( !fired || stack ) ) {
                        args = args || [];
                        args = [ context, args.slice ? args.slice() : args ];
                        if ( firing ) {
                            stack.push( args );
                        } else {
                            // 直接调用fire
                            fire( args );
                        }
                    }
                    return this;
                },
                // Call all the callbacks with the given arguments
                // 触发
                fire: function() {
                    // 还是调用fireWith
                    self.fireWith( this, arguments );
                    return this;
                },
                // To know if the callbacks have already been called at least once
                fired: function() {
                    return !!fired;
                }
            };

        return self;
    };
    // todo deferred 延迟对象 对异步的统一管理
    jQuery.extend({

        Deferred: function( func ) {
            // 映射数组
            var tuples = [
                    // action, add listener, listener list, final state
                    // resolve 触发 done
                    [ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ], // once memory 多次resolve 不会多次调用done
                    [ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],  // once memory 多次reject 不会多次调用fail
                    [ "notify", "progress", jQuery.Callbacks("memory") ]    // memory   进行中可以调用多次 触发多次
                ],
                // 默认状态是pending
                state = "pending",
                // 定义一个对象
                promise = {
                    // 获得状态字符串
                    state: function() {
                        return state;
                    },
                    // always 添加不管成功失败始终都会触发的方法，同时添加到成功和失败的回调中
                    always: function() {
                        deferred.done( arguments ).fail( arguments );
                        return this;
                    },
                    // 添加回调 参数列表是成功的回调、失败的回调、进行中的回调
                    then: function( /* fnDone, fnFail, fnProgress */ ) {
                        var fns = arguments;
                        return jQuery.Deferred(function( newDefer ) {
                            jQuery.each( tuples, function( i, tuple ) {
                                // 触发的字符串
                                var action = tuple[ 0 ],
                                    // 从参数列表中取得对应的回调
                                    fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
                                // deferred[ done | fail | progress ] for forwarding actions to newDefer
                                // 往对应的队列中添加回调
                                deferred[ tuple[1] ](function() {
                                    // 调用回调
                                    var returned = fn && fn.apply( this, arguments );
                                    // 调用之后的返回值.promise如果是一个方法
                                    if ( returned && jQuery.isFunction( returned.promise ) ) {
                                        // pip
                                        returned.promise()
                                            .done( newDefer.resolve )
                                            .fail( newDefer.reject )
                                            .progress( newDefer.notify );
                                    } else {
                                        newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
                                    }
                                });
                            });
                            fns = null;
                        }).promise();
                    },
                    // Get a promise for this deferred
                    // If obj is provided, the promise aspect is added to the object
                    promise: function( obj ) {
                        // 如果有传参 就合并参数和当前的promise对象  不传参数就直接返回promise
                        return obj != null ? jQuery.extend( obj, promise ) : promise;
                    }
                },
                // 定义一个空对象 新建延迟对象返回的就是这个
                // 属性 resolve reject notify  resolveWith  rejectWith  notifyWith
                deferred = {};
            // deferred
            // promise

            // Keep pipe for back-compat
            // 兼容老版本api
            promise.pipe = promise.then;

            // Add list-specific methods
            // 遍历上面定义的映射数组
            jQuery.each( tuples, function( i, tuple ) {
                // 第三个是回调对象 cb
                var list = tuple[ 2 ],
                    // 第四个是最终状态
                    stateString = tuple[ 3 ];

                // promise[ done | fail | progress ] = list.add
                // 回调对象的add方法 赋值给promise.done   fail   progress
                promise[ tuple[1] ] = list.add;

                // Handle state
                // 最终状态 映射数组只有前两个有定义stateString
                if ( stateString ) {
                    // 向回调队列中添加一个函数
                    list.add(function() {
                        // state = [ resolved | rejected ]
                        // 把状态改成最终状态
                        state = stateString;

                        // [ reject_list | resolve_list ].disable; progress_list.lock
                    //    触发resolve就不能再reject  触发reject就不能再resolve
                    //    这里相当于一次add了三个方法  触发的时候都会被调用
                    //    tuples[ i ^ 1 ][ 2 ].disable  当前是resolve就把reject的队列disable
                    //    tuples[ 2 ][ 2 ].lock 进行中的回调被lock
                    }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
                }

                // deferred[ resolve | reject | notify ]
                // deferred.resolve  定义方法
                deferred[ tuple[0] ] = function() {
                    // 调用resolveWith  rejectWith  notifyWith
                    // 传参是
                    deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
                    return this;
                };
                // 定义 resolveWith  rejectWith  notifyWith 方法  实际就是cb.fireWith
                deferred[ tuple[0] + "With" ] = list.fireWith;
            });

            // Make the deferred a promise
            promise.promise( deferred );

            // Call given func if any
            if ( func ) {
                func.call( deferred, deferred );
            }

            // All done!
            return deferred;
        },

        // Deferred helper
        // 传入的是多个延迟对象 所有的都成功才会走done 有一个失败就走fail
        when: function( subordinate /* , ..., subordinateN */ ) {
            var i = 0,
                // 复制一份传入的参数 转成数组
                resolveValues = core_slice.call( arguments ),
                // 传入的参数个数
                length = resolveValues.length,

                // the count of uncompleted subordinates
                // 未完成的计数器
                // 只传入一个参数并且不是延迟对象的时候 是0  其他情况都是参数的长度
                remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

                // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
                // 过滤后剩余的参数如果只剩一个 就用这个延迟对象 否者就新建一个空的延迟对象
                // 只传入一个参数的时候 返回的是deferred 当他调用完成的时候 相当于走了延迟对象自己的done
                deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

                // Update function for both resolve and progress values
                updateFunc = function( i, contexts, values ) {
                    return function( value ) {
                        contexts[ i ] = this;
                        values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
                        if( values === progressValues ) {
                            // 进行中的调用
                            deferred.notifyWith( contexts, values );
                        } else if ( !( --remaining ) ) {
                            // 当剩余的完成为0 就调用完成
                            deferred.resolveWith( contexts, values );
                        }
                    };
                },

                progressValues, progressContexts, resolveContexts;

            // add listeners to Deferred subordinates; treat others as resolved
            //
            if ( length > 1 ) {
                progressValues = new Array( length );
                progressContexts = new Array( length );
                resolveContexts = new Array( length );
                // 遍历传入的参数
                for ( ; i < length; i++ ) {
                    // 如果是延迟对象
                    if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
                        // 添加回调 完成 进行中
                        // 如果失败了 就直接调用上面新建延迟对象的reject 所以其中有一个失败 整体都是失败
                        resolveValues[ i ].promise()
                            .done( updateFunc( i, resolveContexts, resolveValues ) )
                            .fail( deferred.reject )
                            .progress( updateFunc( i, progressContexts, progressValues ) );
                    } else {
                        // 不是延迟对象 剩余个数减1
                        --remaining;
                    }
                }
            }

            // if we're not waiting on anything, resolve the master
            // 没有剩余的 就直接调用resolve
            if ( !remaining ) {
                deferred.resolveWith( resolveContexts, resolveValues );
            }

            // 延迟对象 外部不能修改状态
            return deferred.promise();
        }
    });
    // todo support 浏览器的功能检测
    // IIFE 初始化的时候就生成了一个对象
    jQuery.support = (function( support ) {
        // support传入的是一个空对象

        // 创建dom元素
        var input = document.createElement("input"),
            fragment = document.createDocumentFragment(),
            div = document.createElement("div"),
            select = document.createElement("select"),
            opt = select.appendChild( document.createElement("option") );

        // Finish early in limited environments
        // 如果默认的没有type 就直接返回
        // 正常情况下type 是 text
        if ( !input.type ) {
            return support;
        }

        // 设置为checkbox
        input.type = "checkbox";

        // Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
        // Check the default checkbox/radio value ("" on old WebKit; "on" elsewhere)
        //
        support.checkOn = input.value !== "";

        // Must access the parent to make an option select properly
        // Support: IE9, IE10
        support.optSelected = opt.selected;

        // Will be defined later
        // 默认
        // dom家在完成之后 才能知道
        support.reliableMarginRight = true;
        support.boxSizingReliable = true;
        support.pixelPosition = false;

        // Make sure checked status is properly cloned
        // Support: IE9, IE10
        //
        input.checked = true;
        support.noCloneChecked = input.cloneNode( true ).checked;

        // Make sure that the options inside disabled selects aren't marked as disabled
        // (WebKit marks them as disabled)
        select.disabled = true;
        support.optDisabled = !opt.disabled;

        // Check if an input maintains its value after becoming a radio
        // Support: IE9, IE10
        input = document.createElement("input");
        input.value = "t";
        input.type = "radio";
        support.radioValue = input.value === "t";

        // #11217 - WebKit loses check when the name is after the checked attribute
        input.setAttribute( "checked", "t" );
        input.setAttribute( "name", "t" );

        fragment.appendChild( input );

        // Support: Safari 5.1, Android 4.x, Android 2.3
        // old WebKit doesn't clone checked state correctly in fragments
        support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

        // Support: Firefox, Chrome, Safari
        // Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
        support.focusinBubbles = "onfocusin" in window;

        // 对克隆节点修改样式 可能会对原来的节点产生影响
        // 背景相关的属性 都这样
        div.style.backgroundClip = "content-box";
        div.cloneNode( true ).style.backgroundClip = "";
        support.clearCloneStyle = div.style.backgroundClip === "content-box";

        // Run tests that need a body at doc ready
        // 有些需要dom家在完成之后才能检测
        // 因为要拿到外层数据的引用所以才返回的是对象
        jQuery(function() {
            var container, marginDiv,
                // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
                // 样式reset
                divReset = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",
                // 获得body标签
                body = document.getElementsByTagName("body")[ 0 ];

            // 没有找到body就不检测了
            if ( !body ) {
                // Return for frameset docs that don't have a body
                return;
            }

            // 创建一个div
            container = document.createElement("div");
            // 设置样式 宽高为0 定位移出屏幕
            container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

            // Check box-sizing and margin behavior.
            // 添加到body上。 这个div变量是外层定义的
            body.appendChild( container ).appendChild( div );

            // 内容为空
            div.innerHTML = "";
            // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
            // 设置样式
            div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%";

            // Workaround failing boxSizing test due to offsetWidth returning wrong value
            // with some non-1 values of body zoom, ticket #13543
            // css转换 用完再还原回来 为了害怕缩放 排除缩放的话 可以直接获得offsetWidth
            // zoom缩放页面
            jQuery.swap( body, body.style.zoom != null ? { zoom: 1 } : {}, function() {
                support.boxSizing = div.offsetWidth === 4;
            });

            // Use window.getComputedStyle because jsdom on node.js will break without it.
            // 是否有getComputedStyle这个api
            if ( window.getComputedStyle ) {
                // 上面设置的是1%  有可能最后能取到的是多少像素
                support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
                // 设置了width: 4px   box-sizing:border-box;    padding:1px;border:1px;
                support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

                // Support: Android 2.3
                // Check if div with explicit width and no margin-right incorrectly
                // gets computed margin-right based on width of container. (#3333)
                // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                // 内部的div
                marginDiv = div.appendChild( document.createElement("div") );
                // 样式重置
                marginDiv.style.cssText = div.style.cssText = divReset;
                // 设置margin
                marginDiv.style.marginRight = marginDiv.style.width = "0";
                // 父元素的宽
                div.style.width = "1px";

                // 没有个卵用
                support.reliableMarginRight =
                    !parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
            }

            // 从dom中删除元素
            body.removeChild( container );
        });

        return support;
    })( {} );

    /*
	Implementation Summary

	1. Enforce API surface and semantic compatibility with 1.9.x branch
	2. Improve the module's maintainability by reducing the storage
		paths to a single mechanism.
	3. Use the same single mechanism to support "private" and "user" data.
	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	5. Avoid exposing implementation details on user objects (eg. expando properties)
	6. Provide a clear path for implementation upgrade to WeakMap in 2014
*/
    // todo data数据缓存
    var data_user, data_priv,
        rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
        rmultiDash = /([A-Z])/g;

    // 构造函数
    function Data() {
        // Support: Android < 4,
        // Old WebKit does not have Object.preventExtensions/freeze method,
        // return new empty object instead with no [[set]] accessor
        // 防止定义的对象（this.cache）[0] 被修改
        Object.defineProperty( this.cache = {}, 0, {
            get: function() {
                return {};
            }
        });

        // 添加一个唯一的识别码 添加属性的时候作为唯一的键
        this.expando = jQuery.expando + Math.random();
    }

    Data.uid = 1;

    Data.accepts = function( owner ) {
        // Accepts only:
        //  - Node
        //    - Node.ELEMENT_NODE
        //    - Node.DOCUMENT_NODE
        //  - Object
        //    - Any
        // 节点对象 必须是元素或者document 否则就是false
        return owner.nodeType ?
            owner.nodeType === 1 || owner.nodeType === 9 : true;
    };

    Data.prototype = {
        // 给dom分配映射的键
        // 执行完之后 会在入参的对象上扩展 一个随机的键 值是自增的id  函数返回值也是这个自增的id
        // 对于同一个dom元素 生成的key是相同的
        key: function( owner ) {
            // We can accept data for non-element nodes in modern browsers,
            // but we should not, see #8335.
            // Always return the key for a frozen object.
            // 如果是注释节点 或者 属性节点等等 就直接返回0

            if ( !Data.accepts( owner ) ) {
                return 0;
            }

            var descriptor = {},
                // Check if the owner object already has a cache key
                // 先根据key取值
                unlock = owner[ this.expando ];

            // If not, create one
            // 第一次进来的时候是没有的   创建一个
            if ( !unlock ) {
                // id自增 当做value
                unlock = Data.uid++;

                // Secure it in a non-enumerable, non-writable property
                try {
                    // 键是随机字符串  值是自增的id
                    descriptor[ this.expando ] = { value: unlock };
                    // 合并的owner上
                    Object.defineProperties( owner, descriptor );

                    // Support: Android < 4
                    // Fallback to a less secure definition
                } catch ( e ) {
                    descriptor[ this.expando ] = unlock;
                    // 也是往owner上扩展
                    jQuery.extend( owner, descriptor );
                }
            }

            // Ensure the cache object
            // 添加到缓存中 一个空对象
            if ( !this.cache[ unlock ] ) {
                this.cache[ unlock ] = {};
            }

            // 返回自增的id
            return unlock;
        },
        set: function( owner, data, value ) {
            var prop,
                // There may be an unlock assigned to this node,
                // if there is no entry for this "owner", create one inline
                // and set the unlock as though an owner entry had always existed
                // 获得元素的id
                unlock = this.key( owner ),
                // 根据id拿到 对应的缓存对象
                cache = this.cache[ unlock ];

            // Handle: [ owner, key, value ] args
            // data是要设置的键 value是要设置的值
            if ( typeof data === "string" ) {
                // 往cache中添加
                cache[ data ] = value;

                // Handle: [ owner, { properties } ] args
            } else {
                // data也可以是对象写法
                // Fresh assignments by object are shallow copied
                // 如果以前没有设置过缓存数据
                if ( jQuery.isEmptyObject( cache ) ) {
                    // 往对应缓存上扩展属性
                    jQuery.extend( this.cache[ unlock ], data );
                    // Otherwise, copy the properties one-by-one to the cache object
                } else {
                    // 遍历data的所有属性 添加到cache中
                    for ( prop in data ) {
                        cache[ prop ] = data[ prop ];
                    }
                }
            }
            return cache;
        },
        get: function( owner, key ) {
            // Either a valid cache is found, or will be created.
            // New caches will be created and the unlock returned,
            // allowing direct access to the newly created
            // empty data object. A valid owner object must be provided.
            // 先拿到dom元素对应的id 然后从cache中取值
            var cache = this.cache[ this.key( owner ) ];

            // 没有传key就把整个缓存对象全部返回
            return key === undefined ?
                cache : cache[ key ];
        },
        // 整合 get  set  一个值是取 两个值是设置
        access: function( owner, key, value ) {
            var stored;
            // In cases where either:
            //
            //   1. No key was specified
            //   2. A string key was specified, but no value provided
            //
            // Take the "read" path and allow the get method to determine
            // which value to return, respectively either:
            //
            //   1. The entire cache object
            //   2. The data stored at the key
            //
            // 直接调用 没有key 把整个对象返回
            // 有key没有value 返回对应的缓存数据
            if ( key === undefined ||
                ((key && typeof key === "string") && value === undefined) ) {

                stored = this.get( owner, key );

                // 没有取到 转驼峰再取一次
                return stored !== undefined ?
                    stored : this.get( owner, jQuery.camelCase(key) );
            }

            // [*]When the key is not a string, or both a key and value
            // are specified, set or extend (existing objects) with either:
            //
            //   1. An object of properties
            //   2. A key and value
            //
            // 不是获取 就是设置了
            this.set( owner, key, value );

            // Since the "set" path can have two possible entry points
            // return the expected data based on which path was taken[*]
            return value !== undefined ? value : key;
        },
        // 删除
        remove: function( owner, key ) {
            var i, name, camel,
                unlock = this.key( owner ),
                cache = this.cache[ unlock ];

            // 不指定key 把所有的都删除
            if ( key === undefined ) {
                this.cache[ unlock ] = {};

            } else {
                // Support array or space separated string of keys
                // key是个数组  删除多个
                if ( jQuery.isArray( key ) ) {
                    // If "name" is an array of keys...
                    // When data is initially created, via ("key", "val") signature,
                    // keys will be converted to camelCase.
                    // Since there is no way to tell _how_ a key was added, remove
                    // both plain key and camelCase key. #12786
                    // This will only penalize the array argument path.
                    // 转驼峰
                    name = key.concat( key.map( jQuery.camelCase ) );
                } else {
                    camel = jQuery.camelCase( key );
                    // Try the string as a key before any manipulation
                    if ( key in cache ) {
                        name = [ key, camel ];
                    } else {
                        // If a key with the spaces exists, use it.
                        // Otherwise, create an array by matching non-whitespace
                        name = camel;
                        name = name in cache ?
                            [ name ] : ( name.match( core_rnotwhite ) || [] );
                    }
                }

                i = name.length;
                // 循环删除
                while ( i-- ) {
                    // delete运算符 从对象中删除指定的键
                    delete cache[ name[ i ] ];
                }
            }
        },
        // 判断是否有缓存
        hasData: function( owner ) {
            return !jQuery.isEmptyObject(
                this.cache[ owner[ this.expando ] ] || {}
            );
        },
        // 删除整个缓存
        discard: function( owner ) {
            if ( owner[ this.expando ] ) {
                delete this.cache[ owner[ this.expando ] ];
            }
        }
    };

// These may be used throughout the jQuery core codebase
//    用户使用的data
    data_user = new Data();
    // jq私有使用的data
    data_priv = new Data();


    // 往jq上扩展 静态方法
    jQuery.extend({
        // 构造函数的静态方法
        acceptData: Data.accepts,

        // 判断是否存在数据
        hasData: function( elem ) {
            return data_user.hasData( elem ) || data_priv.hasData( elem );
        },

        // 往elem上添加数据
        data: function( elem, name, data ) {
            return data_user.access( elem, name, data );
        },

        // 从elem上删除数据
        removeData: function( elem, name ) {
            data_user.remove( elem, name );
        },

        // TODO: Now that all calls to _data and _removeData have been replaced
        // with direct calls to data_priv methods, these can be deprecated..
        // 私有的 data调用方法
        _data: function( elem, name, data ) {
            return data_priv.access( elem, name, data );
        },

        _removeData: function( elem, name ) {
            data_priv.remove( elem, name );
        }
    });

    // 往jq的原型上扩展 jq对象可以使用
    jQuery.fn.extend({
        // 一个参数获取
        // 两个参数添加
        data: function( key, value ) {
            var attrs, name,
                // 因为是扩展在了原型上 所以this是指 当前的jq对象  获取第一个dom元素
                elem = this[ 0 ],
                i = 0,
                data = null;

            // Gets all values
            // 如果没有指定key 就是获取所有的缓存数据
            if ( key === undefined ) {
                // 如果当前jq对象里面有元素
                if ( this.length ) {
                    // 调用get获取 所有的缓存对象
                    data = data_user.get( elem );

                    // 如果是一个元素节点 并且 元素上没有hasDataAttrs为值的缓存数据这里是一个标记位
                    // h5里面的dataset 也当做数据缓存
                    // data_priv私有的 对用户存储没有影响
                    if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
                        // 获取dom元素的所有属性
                        attrs = elem.attributes;
                        // 遍历属性
                        for ( ; i < attrs.length; i++ ) {
                            // 属性的键
                            name = attrs[ i ].name;

                            // 键是以data- 开头
                            if ( name.indexOf( "data-" ) === 0 ) {
                                // 键排除data- 剩余的转驼峰
                                name = jQuery.camelCase( name.slice(5) );
                                //
                                dataAttr( elem, name, data[ name ] );
                            }
                        }
                        // 设置标记位
                        data_priv.set( elem, "hasDataAttrs", true );
                    }
                }

                return data;
            }

            // Sets multiple values
            // key是一个对象  是要设置多个属性值
            if ( typeof key === "object" ) {
                // 遍历调用set
                return this.each(function() {
                    data_user.set( this, key );
                });
            }

            return jQuery.access( this, function( value ) {
                var data,
                    camelKey = jQuery.camelCase( key );

                // The calling jQuery object (element matches) is not empty
                // (and therefore has an element appears at this[ 0 ]) and the
                // `value` parameter was not undefined. An empty jQuery object
                // will result in `undefined` for elem = this[ 0 ] which will
                // throw an exception if an attempt to read a data cache is made.
                // 没有value就是获取
                if ( elem && value === undefined ) {
                    // Attempt to get data from the cache
                    // with the key as-is
                    // 找到了就返回
                    data = data_user.get( elem, key );
                    if ( data !== undefined ) {
                        return data;
                    }

                    // Attempt to get data from the cache
                    // with the key camelized
                    // 没找到转驼峰找
                    data = data_user.get( elem, camelKey );
                    if ( data !== undefined ) {
                        return data;
                    }

                    // Attempt to "discover" the data in
                    // HTML5 custom data-* attrs
                    // 再没找到 就用html5的dataset找
                    data = dataAttr( elem, camelKey, undefined );
                    if ( data !== undefined ) {
                        return data;
                    }

                    // We tried really hard, but the data doesn't exist.
                    return;
                }

                // Set the data...
                // 不是获取 就是设置
                this.each(function() {
                    // First, attempt to store a copy or reference of any
                    // data that might've been store with a camelCased key.
                    // 存的是很 先拿转驼峰的键取出来 看看有没有
                    var data = data_user.get( this, camelKey );

                    // For HTML5 data-* attribute interop, we have to
                    // store property names with dashes in a camelCase form.
                    // This might not apply to all properties...*
                    // 把键转驼峰存进去
                    data_user.set( this, camelKey, value );

                    // *... In the case of properties that might _actually_
                    // have dashes, we need to also store a copy of that
                    // unchanged property.
                    // 如果键里面有 - 连接的 并且转驼峰之后能取出 证明之前用过驼峰键 存过  现在要用-连接的存
                    if ( key.indexOf("-") !== -1 && data !== undefined ) {
                        // 尼玛给覆盖了？
                        data_user.set( this, key, value );
                    }
                });
                                         // 一个参数获取 传true false
            }, null, value, arguments.length > 1, null, true );
        },

        // 通过key删除数据
        removeData: function( key ) {
            return this.each(function() {
                data_user.remove( this, key );
            });
        }
    });

    function dataAttr( elem, key, data ) {
        var name;

        // If nothing was found internally, try to fetch any
        // data from the HTML5 data-* attribute
        if ( data === undefined && elem.nodeType === 1 ) {
            name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
            data = elem.getAttribute( name );

            if ( typeof data === "string" ) {
                try {
                    // 只能获取字符串  所以 要转成对应的数据类型
                    // boolean
                    data = data === "true" ? true :
                        data === "false" ? false :
                            // null
                            data === "null" ? null :
                                // Only convert to a number if it doesn't change the string
                                // 字符串
                                +data + "" === data ? +data :
                                    // 对象
                                    rbrace.test( data ) ? JSON.parse( data ) :
                                        data;
                } catch( e ) {}

                // Make sure we set the data so it isn't changed later
                // 调用set存储一下
                data_user.set( elem, key, data );
            } else {
                data = undefined;
            }
        }
        return data;
    }
    // todo queue队列管理
    // 队列中存储的都是函数 出队的时候被执行
    jQuery.extend({
        queue: function( elem, type, data ) {
            var queue;

            // 没有传入元素就什么都不做
            if ( elem ) {
                // 队列名称 没有默认fx
                type = ( type || "fx" ) + "queue";
                // 私有数据缓存 取得上次的队列
                queue = data_priv.get( elem, type );

                // Speed up dequeue by getting out quickly if this is just a lookup
                // DATA是要加入的回调队列函数  没传data就返回当前队列
                if ( data ) {
                    // 之前没有往私有数据缓存中存过数据  或者要存入的是个数组（可以一次入队多个，会覆盖之前入队未出队的函数）
                    if ( !queue || jQuery.isArray( data ) ) {
                        // 转成数组 存进缓存
                        queue = data_priv.access( elem, type, jQuery.makeArray(data) );
                    } else {
                        // queue存在 说明数据缓存中已经有了 可以直接添加
                        queue.push( data );
                    }
                }
                return queue || [];
            }
        },

        dequeue: function( elem, type ) {
            // 默认的键
            type = type || "fx";

            // 获得当前的队列
            var queue = jQuery.queue( elem, type ),
                // 队列长度
                startLength = queue.length,
                // 出队一个函数
                fn = queue.shift(),
                // 清空队列的时候用到的
                hooks = jQuery._queueHooks( elem, type ),
                // 构造一个next函数，内部调用dequeue  后面要当做参数
                next = function() {
                    jQuery.dequeue( elem, type );
                };

            // If the fx queue is dequeued, always remove the progress sentinel
            // 出队的是一个字符串
            // animate相关 一个标记位  调用animate的时候 不用再调出队 可以直接播放动画
            if ( fn === "inprogress" ) {
                // 再出队一个 变换长度
                fn = queue.shift();
                startLength--;
            }

            // 出队的有函数
            if ( fn ) {

                // Add a progress sentinel to prevent the fx queue from being
                // automatically dequeued
                // 如果是默认的键  就添加inprogress
                // 如果是默认的 最前面一定有inprogress 防止animate播放第二次再调用出队
                if ( type === "fx" ) {
                    queue.unshift( "inprogress" );
                }

                // clear up the last queue stop function
                // 清除定时器 延迟出队用
                delete hooks.stop;
                // 出队的函数调用  传入next调用next的时候就是执行出队    hooks
                fn.call( elem, next, hooks );
            }

            // 如果没有了  就删除放在缓存中的方法引用
            if ( !startLength && hooks ) {
                hooks.empty.fire();
            }
        },

        // not intended for public consumption - generates a queueHooks object, or returns the current one
        _queueHooks: function( elem, type ) {
            // 构造键
            var key = type + "queueHooks";
            // 缓存中如果有就取出来返回  没有就添加一个对象 empty是一个回调队列要删除缓存的队列方法
            return data_priv.get( elem, key ) || data_priv.access( elem, key, {
                empty: jQuery.Callbacks("once memory").add(function() {
                    data_priv.remove( elem, [ type + "queue", key ] );
                })
            });
        }
    });

    jQuery.fn.extend({
        queue: function( type, data ) {
            var setter = 2;

            // 修正参数位置  type可以省略 默认fx
            if ( typeof type !== "string" ) {
                data = type;
                type = "fx";
                setter--;
            }

            // 参数只有一个的时候是查看队列  直接返回队列引用
            if ( arguments.length < setter ) {
                // this[0] jq对象中的第一个元素
                return jQuery.queue( this[0], type );
            }

            return data === undefined ?
                this :
                // 对每个dom元素都设置
                this.each(function() {
                    // 入队
                    var queue = jQuery.queue( this, type, data );

                    // ensure a hooks for this queue
                    //
                    jQuery._queueHooks( this, type );

                    // 键是默认的 第一个不是inprogress 就直接出队  如果第一个是inprogress证明之前已经调用过出队了
                    // animate
                    // 入队的时候 直接出队
                    if ( type === "fx" && queue[0] !== "inprogress" ) {
                        jQuery.dequeue( this, type );
                    }
                });
        },
        dequeue: function( type ) {
            // 对每个dom元素都出队
            return this.each(function() {
                jQuery.dequeue( this, type );
            });
        },
        // Based off of the plugin by Clint Helfers, with permission.
        // http://blindsignals.com/index.php/2009/07/jquery-delay/
        // 延迟执行队列
        delay: function( time, type ) {
            // fast slow default 字符串对应的执行时间  可以是字符串 也可以指定具体时间
            time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
            type = type || "fx";

            // 入队一个方法
            return this.queue( type, function( next, hooks ) {
                // N秒之后继续出队
                var timeout = setTimeout( next, time );
                // 清除定时器
                hooks.stop = function() {
                    clearTimeout( timeout );
                };
            });
        },
        // 设置队列为空数组
        clearQueue: function( type ) {
            return this.queue( type || "fx", [] );
        },
        // Get a promise resolved when queues of a certain type
        // are emptied (fx is the type by default)
        promise: function( type, obj ) {
            var tmp,
                // 计数器
                count = 1,
                // 延迟对象
                defer = jQuery.Deferred(),
                elements = this,
                i = this.length,
                resolve = function() {
                    // 计数器减1 如果为0 就调用延迟对象的resolve
                    if ( !( --count ) ) {
                        defer.resolveWith( elements, [ elements ] );
                    }
                };

            if ( typeof type !== "string" ) {
                obj = type;
                type = undefined;
            }
            type = type || "fx";

            // 循环所有的dom元素
            while( i-- ) {
                // 通过缓存拿到上面的回调对象
                tmp = data_priv.get( elements[ i ], type + "queueHooks" );
                if ( tmp && tmp.empty ) {
                    // 添加计数器
                    count++;
                    // 加到回调中
                    tmp.empty.add( resolve );
                }
            }
            resolve();
            return defer.promise( obj );
        }
    });
    // todo  attr/prop/val/addClass 对元素属性的操作
    var nodeHook, boolHook,
        rclass = /[\t\r\n\f]/g,
        rreturn = /\r/g,
        rfocusable = /^(?:input|select|textarea|button)$/i;

    // 实例方法
    jQuery.fn.extend({
        attr: function( name, value ) {
            // 实际是调用静态方法  chainable 就是一个获取两个设置
            return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
        },

        removeAttr: function( name ) {
            // 遍历所有的dom元素 然后调用静态方法
            return this.each(function() {
                jQuery.removeAttr( this, name );
            });
        },

        prop: function( name, value ) {
            return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
        },

        removeProp: function( name ) {
            // 遍历之后 直接调用delete删除属性
            return this.each(function() {
                delete this[ jQuery.propFix[ name ] || name ];
            });
        },

        // 添加类名 多个类名用空格分隔字符串
        addClass: function( value ) {
            var classes, elem, cur, clazz, j,
                i = 0,
                // jq对象中包含dom元素的个数
                len = this.length,
                // 如果传入的是字符串 就是他本身 如果是其他类型就是false
                proceed = typeof value === "string" && value;

            // 可以传入一个回调函数 函数的参数是dom元素的索引 返回值是要设置的类名
            if ( jQuery.isFunction( value ) ) {
                // 遍历所有的dom元素
                return this.each(function( j ) {
                    // 把当前的dom元素转换成jq对象然后调用addClass
                    // 调用传入的函数 函数的返回值被当做addClass的参数添加
                    jQuery( this ).addClass( value.call( this, j, this.className ) );
                });
            }

            // 当传入的是一个字符串的时候
            if ( proceed ) {
                // The disjunction here is for better compressibility (see removeClass)
                // 切割多个 当成数组
                classes = ( value || "" ).match( core_rnotwhite ) || [];

                // 遍历所有的dom元素
                for ( ; i < len; i++ ) {
                    elem = this[ i ];
                    // 如果是元素类型
                    // 现在没有类名返回的是 空格
                    // 有类名就给他前后添加空格
                    cur = elem.nodeType === 1 && ( elem.className ?
                            ( " " + elem.className + " " ).replace( rclass, " " ) :
                            " "
                    );

                    if ( cur ) {
                        j = 0;
                        // 遍历要添加的传入类名
                        while ( (clazz = classes[j++]) ) {
                            // 要添加的类名 不在当前类名中 就拼接字符串添加
                            if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
                                cur += clazz + " ";
                            }
                        }
                        // 除去前后空格
                        elem.className = jQuery.trim( cur );

                    }
                }
            }

            return this;
        },

        // 删除类名
        removeClass: function( value ) {
            var classes, elem, cur, clazz, j,
                i = 0,
                // jq对象中包含dom元素的个数
                len = this.length,
                proceed = arguments.length === 0 || typeof value === "string" && value;

            // 传入的是一个回调
            if ( jQuery.isFunction( value ) ) {
                // 遍历每个dom元素 调用removeClass
                return this.each(function( j ) {
                    // 根据索引和现有类名在回调中判断 最后返回值是要删除的类名
                    jQuery( this ).removeClass( value.call( this, j, this.className ) );
                });
            }
            if ( proceed ) {
                // 切割多个类名
                classes = ( value || "" ).match( core_rnotwhite ) || [];

                // 遍历所有dom元素
                for ( ; i < len; i++ ) {
                    elem = this[ i ];
                    // This expression is here for better compressibility (see addClass)
                    // 如果是元素类型
                    // 现在没有类名返回的是 空格
                    // 有类名就给他前后添加空格
                    cur = elem.nodeType === 1 && ( elem.className ?
                            ( " " + elem.className + " " ).replace( rclass, " " ) :
                            ""
                    );

                    if ( cur ) {
                        j = 0;
                        // 遍历传入的类名切割后的数组
                        while ( (clazz = classes[j++]) ) {
                            // Remove *all* instances
                            // 如果当前类名中有要删除的类名
                            while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
                                // 调用replace 替换成空格 先当于删除
                                cur = cur.replace( " " + clazz + " ", " " );
                            }
                        }
                        // 如果删除之后还有值 就删除两边空格  没有值 就返回空字符串
                        elem.className = value ? jQuery.trim( cur ) : "";
                    }
                }
            }

            // 链式调用
            return this;
        },

        // 切换类名 有就删除没有就添加
        // stateVal为true就是执行添加操作
        // stateVal为false就是执行删除操作
        toggleClass: function( value, stateVal ) {
            var type = typeof value;

            // stateVal是否为布尔值  type是否为字符串
            if ( typeof stateVal === "boolean" && type === "string" ) {
                // stateVal为true就是执行添加
                // stateVal为false就是执行删除
                return stateVal ? this.addClass( value ) : this.removeClass( value );
            }

            // 传入的是回调函数
            if ( jQuery.isFunction( value ) ) {
                // 遍历每个dom元素 执行回调 在递归调用toggleClass
                return this.each(function( i ) {
                    jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
                });
            }

            return this.each(function() {
                if ( type === "string" ) {
                    // toggle individual class names
                    var className,
                        i = 0,
                        self = jQuery( this ),
                        classNames = value.match( core_rnotwhite ) || [];

                    // 遍历传入的类名组成的数组
                    while ( (className = classNames[ i++ ]) ) {
                        // check each className given, space separated list
                        // 如果有就删除 没有就添加
                        if ( self.hasClass( className ) ) {
                            self.removeClass( className );
                        } else {
                            self.addClass( className );
                        }
                    }

                    // Toggle whole class name
                } else if ( type === core_strundefined || type === "boolean" ) {
                    // 传入的是undefined 或者 布尔

                    // 如果有类名 就存在私有的数据缓存中
                    if ( this.className ) {
                        // store className if set
                        data_priv.set( this, "__className__", this.className );
                    }

                    // If the element has a class name or if we're passed "false",
                    // then remove the whole classname (if there was one, the above saved it).
                    // Otherwise bring back whatever was previously saved (if anything),
                    // falling back to the empty string if nothing was stored.
                    // toggleClass第一个参数传入的是false就把所有的类名删除  如果是true把之前存在数据缓存中的类名取出来设置上
                    this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
                }
            });
        },

        // 判断类名是否存在
        hasClass: function( selector ) {
            // 左右拼空格
            var className = " " + selector + " ",
                i = 0,
                l = this.length;
            for ( ; i < l; i++ ) {
                // 循环所有的dom元素  如果其中有一个包含这个类名就返回true
                if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
                    return true;
                }
            }

            return false;
        },

        val: function( value ) {
            var hooks, ret, isFunction,
                elem = this[0];

            // 没有传参就是获取值
            if ( !arguments.length ) {
                // 第一个dom元素
                if ( elem ) {
                    // 补丁方法
                    hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

                    // 如果有补丁方法就调用
                    if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
                        return ret;
                    }

                    // 没有就直接点
                    ret = elem.value;

                    // 是字符串就替换换行
                    // 为null就返回字符串
                    return typeof ret === "string" ?
                        // handle most common string cases
                        ret.replace(rreturn, "") :
                        // handle cases where value is null/undef or number
                        ret == null ? "" : ret;
                }

                return;
            }

            // 设置

            // 判断传入的是否是个函数
            isFunction = jQuery.isFunction( value );

            // 遍历dom元素
            return this.each(function( i ) {
                var val;

                // 如果不是元素就直接返回
                if ( this.nodeType !== 1 ) {
                    return;
                }

                if ( isFunction ) {
                    // 如果是个函数 就调用一下 把返回值设置成values
                    val = value.call( this, i, jQuery( this ).val() );
                } else {
                    val = value;
                }

                // Treat null/undefined as ""; convert numbers to string
                if ( val == null ) {
                    // 默认值
                    val = "";
                } else if ( typeof val === "number" ) {
                    // 如果是数字 转成字符串
                    val += "";
                } else if ( jQuery.isArray( val ) ) {
                    // 如果是个数组 就拼接成字符串
                    val = jQuery.map(val, function ( value ) {
                        return value == null ? "" : value + "";
                    });
                }

                // 获取补丁方法
                hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

                // If set returns undefined, fall back to normal setting
                // 如果有补丁 就调用补丁方法
                if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
                    // 米有补丁 就直接设置到value上
                    this.value = val;
                }
            });
        }
    });

    // 静态方法
    jQuery.extend({
        valHooks: {
            // option获取值的兼容
            option: {
                get: function( elem ) {
                    // attributes.value is undefined in Blackberry 4.7 but
                    // uses .value. See #6932
                    var val = elem.attributes.value;
                    return !val || val.specified ? elem.value : elem.text;
                }
            },
            // select获取值设置值的兼容
            select: {
                get: function( elem ) {
                    var value, option,
                        options = elem.options,
                        index = elem.selectedIndex,
                        one = elem.type === "select-one" || index < 0,
                        values = one ? null : [],
                        max = one ? index + 1 : options.length,
                        i = index < 0 ?
                            max :
                            one ? index : 0;

                    // Loop through all the selected options
                    for ( ; i < max; i++ ) {
                        option = options[ i ];

                        // IE6-9 doesn't update selected after form reset (#2551)
                        if ( ( option.selected || i === index ) &&
                            // Don't return options that are disabled or in a disabled optgroup
                            ( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
                            ( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

                            // Get the specific value for the option
                            value = jQuery( option ).val();

                            // We don't need an array for one selects
                            if ( one ) {
                                return value;
                            }

                            // Multi-Selects return an array
                            values.push( value );
                        }
                    }

                    return values;
                },

                set: function( elem, value ) {
                    var optionSet, option,
                        options = elem.options,
                        values = jQuery.makeArray( value ),
                        i = options.length;

                    while ( i-- ) {
                        option = options[ i ];
                        if ( (option.selected = jQuery.inArray( jQuery(option).val(), values ) >= 0) ) {
                            optionSet = true;
                        }
                    }

                    // force browsers to behave consistently when non-matching value is set
                    if ( !optionSet ) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }
        },

        attr: function( elem, name, value ) {
            var hooks, ret,
                nType = elem.nodeType;

            // don't get/set attributes on text, comment and attribute nodes
            // 为空判断  文本 注释 属性节点 就不设置了
            if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
                return;
            }

            // Fallback to prop when attributes are not supported
            // 一些不支持getAttribute方法的 就用prop代替
            if ( typeof elem.getAttribute === core_strundefined ) {
                return jQuery.prop( elem, name, value );
            }

            // All attributes are lowercase
            // Grab necessary hook if one is defined
            // 不是元素节点 或者 不是xml的节点（xml自定义属性）
            if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
                // 要设置和获取的键 转小写
                name = name.toLowerCase();
                // support只是检测  hooks是对不支持的功能实现
                // attrHooks是对attr方法打的补丁
                hooks = jQuery.attrHooks[ name ] ||
                    // Sizzle.match.bool
                    // checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped
                    // 传入的键能够匹配  值就应该是布尔类型
                    ( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
            }

            if ( value !== undefined ) {

                // 要设置的值 直接传null 就是要删除
                if ( value === null ) {
                    jQuery.removeAttr( elem, name );

                } else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
                    // hooks中有set属性 就直接调用 把返回值返回
                    return ret;

                } else {
                    // 不需要hooks处理兼容问题  就使用setAttribute
                    elem.setAttribute( name, value + "" );
                    return value;
                }

            } else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
                // value为undefined
                // hooks中有get属性 就直接调用 把返回值返回
                return ret;

            } else {
                // hooks中没有get 不需要兼容

                // Sizzle.attr  对getAttribute的封装
                ret = jQuery.find.attr( elem, name );

                // Non-existent attributes return null, we normalize to undefined
                return ret == null ?
                    undefined :
                    ret;
            }
        },

        removeAttr: function( elem, value ) {
            var name, propName,
                i = 0,
                // 要删除的属性名  可以传入一个字符串 用空格分隔 一起删除多个属性
                attrNames = value && value.match( core_rnotwhite );

            // 传入了要删除的属性名称  是元素类型
            if ( attrNames && elem.nodeType === 1 ) {
                // 循环数组
                while ( (name = attrNames[i++]) ) {
                    // propFix: {"for": "htmlFor", "class": "className"},
                    // 改变一下属性名
                    propName = jQuery.propFix[ name ] || name;

                    // Boolean attributes get special treatment (#10870)
                    // 如果能够匹配的是布尔值  就直接置为false
                    if ( jQuery.expr.match.bool.test( name ) ) {
                        // Set corresponding property to false
                        elem[ propName ] = false;
                    }

                    // 调用原生api删除属性
                    elem.removeAttribute( name );
                }
            }
        },

        // 设置type属性的时候 要打补丁
        attrHooks: {
            type: {
                set: function( elem, value ) {
                    // 功能检测不支持radioValue  对input标签设置
                    if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
                        // Setting the type on a radio button after the value resets the value in IE6-9
                        // Reset value to default in case type is set after value during creation
                        var val = elem.value;
                        // 先设置属性
                        elem.setAttribute( "type", value );
                        if ( val ) {
                            // 再设置值
                            elem.value = val;
                        }
                        return value;
                    }
                }
            }
        },

        propFix: {
            "for": "htmlFor",
            "class": "className"
        },

        prop: function( elem, name, value ) {
            var ret, hooks, notxml,
                nType = elem.nodeType;

            // don't get/set properties on text, comment and attribute nodes
            // 过滤不能设置的元素
            if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
                return;
            }

            // 是不是xml
            notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

            if ( notxml ) {
                // Fix name and attach hooks
                // 不是xml获取 补丁方法 补丁名称
                name = jQuery.propFix[ name ] || name;
                hooks = jQuery.propHooks[ name ];
            }

            if ( value !== undefined ) {
                // 补丁方法去设置
                return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
                    ret :
                    // 没有补丁方法直接赋值
                    ( elem[ name ] = value );

            } else {
                // 补丁方法去获取
                return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
                    ret :
                    // 没有补丁方法直接获取属性
                    elem[ name ];
            }
        },

        // 对.tabIndex 获取打补丁
        // tabIndex是用tab键切换光标的顺序
        propHooks: {
            tabIndex: {
                get: function( elem ) {
                    return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
                        elem.tabIndex :
                        -1;
                }
            }
        }
    });

//    prop可以设置返回true和 false
//    attr只能设置返回具体的内容
// Hooks for boolean attributes
//    布尔设置值的时候 补丁
    boolHook = {
        set: function( elem, value, name ) {
            // 传入的值如果是false 就直接删除这个属性
            if ( value === false ) {
                // Remove boolean attributes when set to false
                jQuery.removeAttr( elem, name );
            } else {
                // 不是false调用setAttribute设置
                elem.setAttribute( name, name );
            }
            return name;
        }
    };
    jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
        var getter = jQuery.expr.attrHandle[ name ] || jQuery.find.attr;

        jQuery.expr.attrHandle[ name ] = function( elem, name, isXML ) {
            var fn = jQuery.expr.attrHandle[ name ],
                ret = isXML ?
                    undefined :
                    /* jshint eqeqeq: false */
                    // Temporarily disable this handler to check existence
                    (jQuery.expr.attrHandle[ name ] = undefined) !=
                    getter( elem, name, isXML ) ?

                        name.toLowerCase() :
                        null;

            // Restore handler
            jQuery.expr.attrHandle[ name ] = fn;

            return ret;
        };
    });

// Support: IE9+
// Selectedness for an option in an optgroup can be inaccurate
//    设置下拉选择菜单中的选中状态 补丁
    if ( !jQuery.support.optSelected ) {
        jQuery.propHooks.selected = {
            get: function( elem ) {
                // 获取父节点
                var parent = elem.parentNode;
                if ( parent && parent.parentNode ) {
                    // ？？？？ 卧槽
                    parent.parentNode.selectedIndex;
                }
                return null;
            }
        };
    }

    // 循环 把里面每一项转小写当成键赋值给jQuery.propFix 未转小写的字符串当成值
    jQuery.each([
        "tabIndex",
        "readOnly",
        "maxLength",
        "cellSpacing",
        "cellPadding",
        "rowSpan",
        "colSpan",
        "useMap",
        "frameBorder",
        "contentEditable"
    ], function() {
        jQuery.propFix[ this.toLowerCase() ] = this;
    });

// Radios and checkboxes getter/setter
    jQuery.each([ "radio", "checkbox" ], function() {
        jQuery.valHooks[ this ] = {
            set: function( elem, value ) {
                if ( jQuery.isArray( value ) ) {
                    return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
                }
            }
        };
        if ( !jQuery.support.checkOn ) {
            jQuery.valHooks[ this ].get = function( elem ) {
                // Support: Webkit
                // "" is returned instead of "on" if a value isn't specified
                return elem.getAttribute("value") === null ? "on" : elem.value;
            };
        }
    });
    // todo on/trigger 事件操作相关方法
    var rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|contextmenu)|click/,
        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
        rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

    function returnTrue() {
        return true;
    }

    function returnFalse() {
        return false;
    }

    function safeActiveElement() {
        try {
            return document.activeElement;
        } catch ( err ) { }
    }

    /*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
    jQuery.event = {

        global: {},

        add: function( elem, types, handler, data, selector ) {

            var handleObjIn, eventHandle, tmp,
                events, t, handleObj,
                special, handlers, type, namespaces, origType,
                // 私有的数据缓存
                elemData = data_priv.get( elem );

            // Don't attach events to noData or text/comment nodes (but allow plain objects)
            // 元素节点 是一个空对象   文本注释节点会是一个null
            if ( !elemData ) {
                return;
            }

            // Caller can pass in an object of custom data in lieu of the handler
            if ( handler.handler ) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }

            // Make sure that the handler has a unique ID, used to find/remove it later
            // 如果没有id 就赋值为唯一
            if ( !handler.guid ) {
                handler.guid = jQuery.guid++;
            }

            // Init the element's event structure and main handler, if this is the first
            // 数据缓存中获得缓存的事件队形
            if ( !(events = elemData.events) ) {
                events = elemData.events = {};
            }
            if ( !(eventHandle = elemData.handle) ) {
                // elemData.handle 是真正要执行的回调
                eventHandle = elemData.handle = function( e ) {
                    // Discard the second event of a jQuery.event.trigger() and
                    // when an event is called after a page has unloaded
                    return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
                        // 最终调用的是dispatch
                        jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
                        undefined;
                };
                // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
                eventHandle.elem = elem;
            }

            // Handle multiple events separated by a space
            // 事件类型可以一次绑定多个 用空格分隔
            types = ( types || "" ).match( core_rnotwhite ) || [""];
            t = types.length;
            // 循环多个事件类型
            while ( t-- ) {
                //
                tmp = rtypenamespace.exec( types[t] ) || [];
                type = origType = tmp[1];
                // 分隔命名空间 并排序
                namespaces = ( tmp[2] || "" ).split( "." ).sort();

                // There *must* be a type, no attaching namespace-only handlers
                if ( !type ) {
                    continue;
                }

                // If event changes its type, use the special event handlers for the changed type
                // 特殊事件类型 有些不支持 需要模拟
                special = jQuery.event.special[ type ] || {};

                // If selector defined, determine special event api type, otherwise given type
                type = ( selector ? special.delegateType : special.bindType ) || type;

                // Update special based on newly reset type
                special = jQuery.event.special[ type ] || {};

                // handleObj is passed to all event handlers
                handleObj = jQuery.extend({
                    // 有可能某些事件不支持 这里需要一个模拟事件
                    type: type,
                    // 需要绑定的事件类型 真正绑定的类型可能不是这个
                    origType: origType,
                    // 绑定的数据会放在event.data中
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    // 代理的选择器
                    selector: selector,
                    needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
                    // 命名空间  click.abc  trigger可以只触发对应的事件
                    namespace: namespaces.join(".")
                }, handleObjIn );

                // Init the event handler queue if we're the first
                if ( !(handlers = events[ type ]) ) {
                    // 事件类型对应的事件回调函数组成的数组
                    handlers = events[ type ] = [];
                    // 委托计数器
                    handlers.delegateCount = 0;

                    // Only use addEventListener if the special events handler returns false
                    if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
                        // 绑定事件
                        if ( elem.addEventListener ) {
                            elem.addEventListener( type, eventHandle, false );
                        }
                    }
                }

                if ( special.add ) {
                    special.add.call( elem, handleObj );

                    if ( !handleObj.handler.guid ) {
                        handleObj.handler.guid = handler.guid;
                    }
                }

                // Add to the element's handler list, delegates in front
                if ( selector ) {
                    handlers.splice( handlers.delegateCount++, 0, handleObj );
                } else {
                    // 添加事件到事件队列中
                    handlers.push( handleObj );
                }

                // Keep track of which events have ever been used, for event optimization
                // 一个标识 暂时未使用
                jQuery.event.global[ type ] = true;
            }

            // Nullify elem to prevent memory leaks in IE
            elem = null;
        },

        // Detach an event or set of events from an element
        remove: function( elem, types, handler, selector, mappedTypes ) {

            var j, origCount, tmp,
                events, t, handleObj,
                special, handlers, type, namespaces, origType,
                elemData = data_priv.hasData( elem ) && data_priv.get( elem );

            if ( !elemData || !(events = elemData.events) ) {
                return;
            }

            // Once for each type.namespace in types; type may be omitted
            types = ( types || "" ).match( core_rnotwhite ) || [""];
            t = types.length;
            while ( t-- ) {
                tmp = rtypenamespace.exec( types[t] ) || [];
                // 正则匹配的传入事件类型
                type = origType = tmp[1];
                // 传入事件的命名空间
                namespaces = ( tmp[2] || "" ).split( "." ).sort();

                // Unbind all events (on this namespace, if provided) for the element
                if ( !type ) {
                    for ( type in events ) {
                        jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
                    }
                    continue;
                }

                special = jQuery.event.special[ type ] || {};
                type = ( selector ? special.delegateType : special.bindType ) || type;
                handlers = events[ type ] || [];
                tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

                // Remove matching events
                origCount = j = handlers.length;
                while ( j-- ) {
                    handleObj = handlers[ j ];

                    if ( ( mappedTypes || origType === handleObj.origType ) &&
                        ( !handler || handler.guid === handleObj.guid ) &&
                        ( !tmp || tmp.test( handleObj.namespace ) ) &&
                        ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
                        handlers.splice( j, 1 );

                        if ( handleObj.selector ) {
                            handlers.delegateCount--;
                        }
                        if ( special.remove ) {
                            special.remove.call( elem, handleObj );
                        }
                    }
                }

                // Remove generic event handler if we removed something and no more handlers exist
                // (avoids potential for endless recursion during removal of special event handlers)
                if ( origCount && !handlers.length ) {
                    if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
                        // 删除事件监听
                        jQuery.removeEvent( elem, type, elemData.handle );
                    }

                    // 自定义事件删除回调
                    delete events[ type ];
                }
            }

            // Remove the expando if it's no longer used
            if ( jQuery.isEmptyObject( events ) ) {
                delete elemData.handle;
                data_priv.remove( elem, "events" );
            }
        },

        trigger: function( event, data, elem, onlyHandlers ) {

            var i, cur, tmp, bubbleType, ontype, handle, special,
                eventPath = [ elem || document ],
                type = core_hasOwn.call( event, "type" ) ? event.type : event,
                namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

            cur = tmp = elem = elem || document;

            // Don't do events on text and comment nodes
            if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
                return;
            }

            // focus/blur morphs to focusin/out; ensure we're not firing them right now
            if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
                return;
            }

            if ( type.indexOf(".") >= 0 ) {
                // Namespaced trigger; create a regexp to match event type in handle()
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }
            ontype = type.indexOf(":") < 0 && "on" + type;

            // Caller can pass in a jQuery.Event object, Object, or just an event type string
            event = event[ jQuery.expando ] ?
                event :
                new jQuery.Event( type, typeof event === "object" && event );

            // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
            event.isTrigger = onlyHandlers ? 2 : 3;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ?
                new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
                null;

            // Clean up the event in case it is being reused
            event.result = undefined;
            if ( !event.target ) {
                event.target = elem;
            }

            // Clone any incoming data and prepend the event, creating the handler arg list
            data = data == null ?
                [ event ] :
                jQuery.makeArray( data, [ event ] );

            // Allow special events to draw outside the lines
            special = jQuery.event.special[ type ] || {};
            if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
                return;
            }

            // Determine event propagation path in advance, per W3C events spec (#9951)
            // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
            if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

                bubbleType = special.delegateType || type;
                if ( !rfocusMorph.test( bubbleType + type ) ) {
                    cur = cur.parentNode;
                }
                for ( ; cur; cur = cur.parentNode ) {
                    eventPath.push( cur );
                    tmp = cur;
                }

                // Only add window if we got to document (e.g., not plain obj or detached DOM)
                if ( tmp === (elem.ownerDocument || document) ) {
                    eventPath.push( tmp.defaultView || tmp.parentWindow || window );
                }
            }

            // Fire handlers on the event path
            i = 0;
            while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

                event.type = i > 1 ?
                    bubbleType :
                    special.bindType || type;

                // jQuery handler
                handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
                if ( handle ) {
                    handle.apply( cur, data );
                }

                // Native handler
                handle = ontype && cur[ ontype ];
                if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
                    event.preventDefault();
                }
            }
            event.type = type;

            // If nobody prevented the default action, do it now
            if ( !onlyHandlers && !event.isDefaultPrevented() ) {

                if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
                    jQuery.acceptData( elem ) ) {

                    // Call a native DOM method on the target with the same name name as the event.
                    // Don't do default actions on window, that's where global variables be (#6170)
                    if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

                        // Don't re-trigger an onFOO event when we call its FOO() method
                        tmp = elem[ ontype ];

                        if ( tmp ) {
                            elem[ ontype ] = null;
                        }

                        // Prevent re-triggering of the same event, since we already bubbled it above
                        jQuery.event.triggered = type;
                        elem[ type ]();
                        jQuery.event.triggered = undefined;

                        if ( tmp ) {
                            elem[ ontype ] = tmp;
                        }
                    }
                }
            }

            return event.result;
        },

        dispatch: function( event ) {

            // Make a writable jQuery.Event from the native event object
            // event兼容处理
            event = jQuery.event.fix( event );

            var i, j, ret, matched, handleObj,
                handlerQueue = [],
                args = core_slice.call( arguments ),
                handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
                // 特殊事件处理
                special = jQuery.event.special[ event.type ] || {};

            // Use the fix-ed jQuery.Event rather than the (read-only) native event
            args[0] = event;
            event.delegateTarget = this;

            // Call the preDispatch hook for the mapped type, and let it bail if desired
            if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
                return;
            }

            // Determine handlers
            // 多个事件执行顺序队列
            // dom元素层级越深 越先
            handlerQueue = jQuery.event.handlers.call( this, event, handlers );

            // Run delegates first; they may want to stop propagation beneath us
            i = 0;
            while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
                event.currentTarget = matched.elem;

                j = 0;
                while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

                    // Triggered event must either 1) have no namespace, or
                    // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                    if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

                        event.handleObj = handleObj;
                        event.data = handleObj.data;

                        ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
                            .apply( matched.elem, args );

                        if ( ret !== undefined ) {
                            // 事件返回结果是false 就阻止默认事件 阻止冒泡
                            if ( (event.result = ret) === false ) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }

            // Call the postDispatch hook for the mapped type
            if ( special.postDispatch ) {
                special.postDispatch.call( this, event );
            }

            return event.result;
        },

        handlers: function( event, handlers ) {
            var i, matches, sel, handleObj,
                handlerQueue = [],
                delegateCount = handlers.delegateCount,
                cur = event.target;

            // Find delegate handlers
            // Black-hole SVG <use> instance trees (#13180)
            // Avoid non-left-click bubbling in Firefox (#3861)
            if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

                for ( ; cur !== this; cur = cur.parentNode || this ) {

                    // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                    if ( cur.disabled !== true || event.type !== "click" ) {
                        matches = [];
                        for ( i = 0; i < delegateCount; i++ ) {
                            handleObj = handlers[ i ];

                            // Don't conflict with Object.prototype properties (#13203)
                            sel = handleObj.selector + " ";

                            if ( matches[ sel ] === undefined ) {
                                matches[ sel ] = handleObj.needsContext ?
                                    jQuery( sel, this ).index( cur ) >= 0 :
                                    jQuery.find( sel, this, null, [ cur ] ).length;
                            }
                            if ( matches[ sel ] ) {
                                matches.push( handleObj );
                            }
                        }
                        if ( matches.length ) {
                            handlerQueue.push({ elem: cur, handlers: matches });
                        }
                    }
                }
            }

            // Add the remaining (directly-bound) handlers
            if ( delegateCount < handlers.length ) {
                handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
            }

            return handlerQueue;
        },

        // Includes some event props shared by KeyEvent and MouseEvent
        // 共享原生 事件的属性
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

        fixHooks: {},

        // 键盘兼容
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function( event, original ) {

                // Add which for key events
                // 键盘的哪个键
                if ( event.which == null ) {
                    // 没有就用charCode  keyCode
                    event.which = original.charCode != null ? original.charCode : original.keyCode;
                }

                return event;
            }
        },

        // 鼠标兼容
        mouseHooks: {
            props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function( event, original ) {
                var eventDoc, doc, body,
                    button = original.button;

                // Calculate pageX/Y if missing and clientX/Y available
                // 对pageX、pageY 的兼容处理 想加
                if ( event.pageX == null && original.clientX != null ) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;

                    event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                    event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
                }

                // Add which for click: 1 === left; 2 === middle; 3 === right
                // Note: button is not normalized, so don't use it
                // 鼠标左中右键 对外兼容
                if ( !event.which && button !== undefined ) {
                    event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
                }

                return event;
            }
        },

        // event对象兼容
        fix: function( event ) {
            if ( event[ jQuery.expando ] ) {
                return event;
            }

            // Create a writable copy of the event object and normalize some properties
            var i, prop, copy,
                type = event.type,
                originalEvent = event,
                fixHook = this.fixHooks[ type ];

            if ( !fixHook ) {
                this.fixHooks[ type ] = fixHook =
                    rmouseEvent.test( type ) ? this.mouseHooks :
                        rkeyEvent.test( type ) ? this.keyHooks :
                            {};
            }
            copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

            event = new jQuery.Event( originalEvent );

            i = copy.length;
            while ( i-- ) {
                prop = copy[ i ];
                event[ prop ] = originalEvent[ prop ];
            }

            // Support: Cordova 2.5 (WebKit) (#13255)
            // All events should have a target; Cordova deviceready doesn't
            if ( !event.target ) {
                event.target = document;
            }

            // Support: Safari 6.0+, Chrome < 28
            // Target should not be a text node (#504, #13143)
            // 是文本节点 就把事件源变成父级
            if ( event.target.nodeType === 3 ) {
                event.target = event.target.parentNode;
            }

            return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
        },

        special: {
            load: {
                // Prevent triggered image.load events from bubbling to window.load
                // 默认情况下 img的load事件 会冒泡的window.onload上
                noBubble: true
            },
            focus: {
                // Fire native event if possible so blur/focus sequence is correct
                // 通过trigger 触发focus
                trigger: function() {
                    //
                    if ( this !== safeActiveElement() && this.focus ) {
                        this.focus();
                        // 返回false不冒泡
                        return false;
                    }
                },
                // 模拟代理
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    if ( this === safeActiveElement() && this.blur ) {
                        this.blur();
                        return false;
                    }
                },
                delegateType: "focusout"
            },
            click: {
                // For checkbox, fire native event so checked state will be right
                trigger: function() {
                    // input tyep="checkbox"  通过trigger主动触发
                    if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
                        // 调用方法
                        this.click();
                        return false;
                    }
                },

                // For cross-browser consistency, don't fire native .click() on links
                _default: function( event ) {
                    // a标签 href跳转
                    return jQuery.nodeName( event.target, "a" );
                }
            },

            // 关闭页面的时候
            beforeunload: {
                // postDispatch事件之后触发  preDispatch事件之前触发
                postDispatch: function( event ) {

                    // Support: Firefox 20+
                    // Firefox doesn't alert if the returnValue field is not set.
                    // 关闭的时候弹出提示信息
                    if ( event.result !== undefined ) {
                        event.originalEvent.returnValue = event.result;
                    }
                }
            }
        },

        // 一些浏览器不兼容  要模拟操作 当成自定义事件
        simulate: function( type, elem, event, bubble ) {
            // Piggyback on a donor event to simulate a different one.
            // Fake originalEvent to avoid donor's stopPropagation, but if the
            // simulated event prevents default then we do the same on the donor.
            var e = jQuery.extend(
                new jQuery.Event(),
                event,
                {
                    type: type,
                    isSimulated: true,
                    originalEvent: {}
                }
            );
            // 是否支持冒泡
            if ( bubble ) {
                jQuery.event.trigger( e, null, elem );
            } else {
                jQuery.event.dispatch.call( elem, e );
            }
            if ( e.isDefaultPrevented() ) {
                event.preventDefault();
            }
        }
    };

    jQuery.removeEvent = function( elem, type, handle ) {
        if ( elem.removeEventListener ) {
            elem.removeEventListener( type, handle, false );
        }
    };

    jQuery.Event = function( src, props ) {
        // Allow instantiation without the 'new' keyword
        if ( !(this instanceof jQuery.Event) ) {
            return new jQuery.Event( src, props );
        }

        // Event object
        if ( src && src.type ) {
            this.originalEvent = src;
            this.type = src.type;

            // Events bubbling up the document may have been marked as prevented
            // by a handler lower down the tree; reflect the correct value.
            this.isDefaultPrevented = ( src.defaultPrevented ||
                src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

            // Event type
        } else {
            this.type = src;
        }

        // Put explicitly provided properties onto the event object
        if ( props ) {
            jQuery.extend( this, props );
        }

        // Create a timestamp if incoming event doesn't have one
        this.timeStamp = src && src.timeStamp || jQuery.now();

        // Mark it as fixed
        this[ jQuery.expando ] = true;
    };

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    jQuery.Event.prototype = {
        // 是否已经阻止类默认事件
        isDefaultPrevented: returnFalse,
        // 是否已经阻止冒泡
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,

        // 阻止默认事件
        preventDefault: function() {
            var e = this.originalEvent;

            // 对他进行重新赋值
            this.isDefaultPrevented = returnTrue;

            if ( e && e.preventDefault ) {
                e.preventDefault();
            }
        },
        // 阻止冒泡
        stopPropagation: function() {
            var e = this.originalEvent;

            this.isPropagationStopped = returnTrue;

            if ( e && e.stopPropagation ) {
                e.stopPropagation();
            }
        },
        // 阻止冒泡 以及本身的其他事件
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        }
    };

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
//   mouseover 模拟mouseenter    mouseout 挂载再special
    jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function( orig, fix ) {
        jQuery.event.special[ orig ] = {
            delegateType: fix,
            bindType: fix,

            handle: function( event ) {
                var ret,
                    target = this,
                    related = event.relatedTarget,
                    handleObj = event.handleObj;

                // For mousenter/leave call the handler if related is outside the target.
                // NB: No relatedTarget if the mouse left/entered the browser window
                // jQuery.contains是否包含关系
                if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply( this, arguments );
                    event.type = fix;
                }
                return ret;
            }
        };
    });

// Create "bubbling" focus and blur events
// Support: Firefox, Chrome, Safari
//
    if ( !jQuery.support.focusinBubbles ) {
        jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

            // Attach a single capturing handler while someone wants focusin/focusout
            var attaches = 0,
                handler = function( event ) {
                    jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
                };

            jQuery.event.special[ fix ] = {
                setup: function() {
                    if ( attaches++ === 0 ) {
                        document.addEventListener( orig, handler, true );
                    }
                },
                teardown: function() {
                    if ( --attaches === 0 ) {
                        document.removeEventListener( orig, handler, true );
                    }
                }
            };
        });
    }

    jQuery.fn.extend({

        // types 事件类型
        // selector 事件委托选择器
        // data 事件回调的参数 最后放在event.data上
        // fn 事件回调
        // one 内部使用
        on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
            var origFn, type;

            // Types can be a map of types/handlers
            // 对多个事件进行绑定的时候 可以传一个对象
            // key是事件名 值是回调
            if ( typeof types === "object" ) {
                // ( types-Object, selector, data )
                // 修正参数位置
                if ( typeof selector !== "string" ) {
                    // ( types-Object, data )
                    // 这两个参数的时候
                    data = data || selector;
                    selector = undefined;
                }
                // 遍历对象  然后递归调用on取班定
                for ( type in types ) {
                    this.on( type, selector, data, types[ type ], one );
                }
                return this;
            }

            // 参数位置修正
            if ( data == null && fn == null ) {
                // ( types, fn )
                // 写这两个参数的时候
                fn = selector;
                data = selector = undefined;
            } else if ( fn == null ) {
                if ( typeof selector === "string" ) {
                    // ( types, selector, fn )
                    // 写这三个参数的时候
                    fn = data;
                    data = undefined;
                } else {
                    // ( types, data, fn )
                    // 写这三个参数的时候
                    fn = data;
                    data = selector;
                    selector = undefined;
                }
            }
            if ( fn === false ) {
                fn = returnFalse;
            } else if ( !fn ) {
                return this;
            }

            // one 内部使用的时候传入1
            // one() 方法只触发一次
            if ( one === 1 ) {
                // 先存一下回调
                origFn = fn;
                // 给回调再次赋值
                fn = function( event ) {
                    // Can use an empty set, since event contains the info
                    // 调用的时候 先解绑
                    // jQuery(this)  jQuery()
                    jQuery().off( event );
                    // 再调用
                    return origFn.apply( this, arguments );
                };
                // Use same guid so caller can remove using origFn
                // guid递增 函数的位置标识 remove使用
                fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
            }
            // 针对每个dom元素 添加参数 最终调用add
            return this.each( function() {
                jQuery.event.add( this, types, fn, data, selector );
            });
        },
        // 调用on 最后一个标识传1  on内部处理
        one: function( types, selector, data, fn ) {
            return this.on( types, selector, data, fn, 1 );
        },
        // types 指定的事件类型
        // selector 需要解绑的委托
        // fn 回调
        off: function( types, selector, fn ) {
            var handleObj, type;
            if ( types && types.preventDefault && types.handleObj ) {
                // ( event )  dispatched jQuery.Event
                handleObj = types.handleObj;
                jQuery( types.delegateTarget ).off(
                    handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                    handleObj.selector,
                    handleObj.handler
                );
                return this;
            }
            // 如果传的是个对象 是要一次解绑多个事件
            if ( typeof types === "object" ) {
                // ( types-object [, selector] )
                for ( type in types ) {
                    // 递归调用off
                    this.off( type, selector, types[ type ] );
                }
                return this;
            }
            // 参数修正
            if ( selector === false || typeof selector === "function" ) {
                // ( types [, fn] )
                fn = selector;
                selector = undefined;
            }
            if ( fn === false ) {
                fn = returnFalse;
            }
            // 遍历dom元素 调用remove解绑
            return this.each(function() {
                jQuery.event.remove( this, types, fn, selector );
            });
        },

        // 直接触发某个事件 触发行为 并且 调用回调
        trigger: function( type, data ) {
            // 遍历每个dom 然后调用event.trigger
            return this.each(function() {
                jQuery.event.trigger( type, data, this );
            });
        },
        // 直接触发某个事件 值调用回调
        triggerHandler: function( type, data ) {
            var elem = this[0];
            if ( elem ) {
                // triggerHandler trigger 区别在于 最后一个参数
                return jQuery.event.trigger( type, data, elem, true );
            }
        }
    });
    var isSimple = /^.[^:#\[\.,]*$/,
        rparentsprev = /^(?:parents|prev(?:Until|All))/,
        rneedsContext = jQuery.expr.match.needsContext,
        // methods guaranteed to produce a unique set when starting from a unique set
        guaranteedUnique = {
            children: true,
            contents: true,
            next: true,
            prev: true
        };
    // todo dom操作
    jQuery.fn.extend({
        // 根据选择器找到当前元素符合条件的子元素
        find: function( selector ) {
            var i,
                ret = [],
                self = this,
                len = self.length;

            // 节点或者
            if ( typeof selector !== "string" ) {
                // 先根据选择器 选择所有符合条件的元素 然后通过filter过滤
                return this.pushStack( jQuery( selector ).filter(function() {
                    for ( i = 0; i < len; i++ ) {
                        // 过滤不在this下的元素
                        if ( jQuery.contains( self[ i ], this ) ) {
                            return true;
                        }
                    }
                }) );
            }

            // 如果是字符串选择器  就遍历所有dom元素调用jQuery.find Sizzle
            // 结果放在ret中
            for ( i = 0; i < len; i++ ) {
                jQuery.find( selector, self[ i ], ret );
            }

            // Needed because $( selector, context ) becomes $( context ).find( selector )
            // 结果去重入栈
            ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
            // 更新保存selector选择器
            ret.selector = this.selector ? this.selector + " " + selector : selector;
            return ret;
        },

        // 子元素是否包含 返回本身
        has: function( target ) {
            // target 转成jq对象  this当做上下文
            var targets = jQuery( target, this ),
                l = targets.length;

            return this.filter(function() {
                var i = 0;
                // 遍历所有元素，是否包含当前元素  返回true就是要保留
                for ( ; i < l; i++ ) {
                    if ( jQuery.contains( this, targets[i] ) ) {
                        return true;
                    }
                }
            });
        },

        // 选择不符合条件的
        not: function( selector ) {
            // 把元素入栈 调用end的时候出栈  链式调用的
            // 最终是通过winnow实现 和filter区别是最后一个参数
            return this.pushStack( winnow(this, selector || [], true) );
        },

        // 选择符合条件的
        filter: function( selector ) {
            return this.pushStack( winnow(this, selector || [], false) );
        },

        // 判断是否符合选择器
        is: function( selector ) {
            // .length 判断是否有元素 然后转boolean返回
            return !!winnow(
                this,

                // If this is a positional/relative selector, check membership in the returned set
                // so $("p:first").is("p:last") won't return true for a doc with two "p".
                //
                typeof selector === "string" && rneedsContext.test( selector ) ?
                    jQuery( selector ) :
                    selector || [],
                false
            ).length;
        },

        // 最近的符合要求的祖先节点 （包含自身）
        closest: function( selectors, context ) {
            var cur,
                i = 0,
                l = this.length,
                matched = [],
                // 伪类 或者 对象  就构造一个jq对象
                pos = ( rneedsContext.test( selectors ) || typeof selectors !== "string" ) ?
                    jQuery( selectors, context || this.context ) :
                    0;

            // 遍历所有dom元素
            for ( ; i < l; i++ ) {
                // cur = cur.parentNode  一直向上找
                // cur !== context  直到找到 符合上下文的条件结束
                // 上下文 就相当于一个限制条件
                for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
                    // Always skip document fragments
                    // 不能是fragments
                    if ( cur.nodeType < 11 && (pos ?
                        pos.index(cur) > -1 :

                        // Don't pass non-elements to Sizzle
                        cur.nodeType === 1 &&
                        jQuery.find.matchesSelector(cur, selectors)) ) {

                        cur = matched.push( cur );
                        break;
                    }
                }
            }

            // 去重 入栈
            return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
        },

        // Determine the position of an element within
        // the matched set of elements
        // 元素在所有兄弟元素做的索引
        index: function( elem ) {

            // No argument, return index in parent
            // 没有参数 返回索引
            if ( !elem ) {
                // 取jq对象中第一个dom元素  并且有父节点的
                // prevAll 前面的所有节点
                return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
            }

            // index in selector
            if ( typeof elem === "string" ) {
                // 根据传入的选择器  查找页面内到所有的元素  通过indexOf获取到索引
                return core_indexOf.call( jQuery( elem ), this[ 0 ] );
            }

            // Locate the position of the desired element
            // 传入的是一个dom节点或者jq对象
            // 在当前jq对象的元素中查找传入的节点索引
            return core_indexOf.call( this,

                // If it receives a jQuery object, the first element is used
                elem.jquery ? elem[ 0 ] : elem
            );
        },

        // 根据选择器 把选中的元素 添加到之前的jq对象中
        add: function( selector, context ) {
            var set = typeof selector === "string" ?
                // 查找jq对象
                jQuery( selector, context ) :
                // dom元素转成数组
                // jq对象转成数组
                jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),

                // 合并 把查找到的元素合并到 现在的jq对象中
                all = jQuery.merge( this.get(), set );

            // 去重 入栈
            return this.pushStack( jQuery.unique(all) );
        },

        // 出栈
        addBack: function( selector ) {
            // 不传参数 就返回栈的上一层
            // 传参 就把上一层通过选择器过滤一下

            // 调用add 然后入栈
            return this.add( selector == null ?
                this.prevObject : this.prevObject.filter(selector)
            );
        }
    });

    function sibling( cur, dir ) {
        // dir兼容原生api

        // 过滤非元素节点
        while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}

        return cur;
    }

    // 调用方法获取对应的节点
    jQuery.each({
        // 直接父节点 并且符合elem
        parent: function( elem ) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        },
        // 所有的父节点 并且符合elem
        parents: function( elem ) {
            return jQuery.dir( elem, "parentNode" );
        },
        // 向上找 直到until
        parentsUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "parentNode", until );
        },
        // 下一个兄弟节点
        next: function( elem ) {
            return sibling( elem, "nextSibling" );
        },
        // 上一个兄弟节点
        prev: function( elem ) {
            return sibling( elem, "previousSibling" );
        },
        // 下面所有的兄弟节点
        nextAll: function( elem ) {
            return jQuery.dir( elem, "nextSibling" );
        },
        // 上面所有的兄弟节点
        prevAll: function( elem ) {
            return jQuery.dir( elem, "previousSibling" );
        },
        // 下面所有的兄弟节点 直到until
        nextUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "nextSibling", until );
        },
        // 上面所有的兄弟节点 直到until
        prevUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "previousSibling", until );
        },
        // 所有的兄弟节点不包含自身
        siblings: function( elem ) {
            return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
        },
        // 所有的子元素
        children: function( elem ) {
            return jQuery.sibling( elem.firstChild );
        },
        // 所有的子节点
        contents: function( elem ) {
            // childNodes原生api
            // contentDocument  iframe相关
            return elem.contentDocument || jQuery.merge( [], elem.childNodes );
        }
    }, function( name, fn ) {
        // 遍历前面一个对象 执行这个回调

        // 添加到原型上
        // selector 选择器   until直到为止
        jQuery.fn[ name ] = function( until, selector ) {
            // 遍历所有的dom元素 映射生成 新的数组
            // until传给fn
            //
            var matched = jQuery.map( this, fn, until );

            // 判断变量名后面有没有Until
            // 切换变量名
            if ( name.slice( -5 ) !== "Until" ) {
                selector = until;
            }

            // 如果是字符串选择器  通过filter 筛选
            if ( selector && typeof selector === "string" ) {
                matched = jQuery.filter( selector, matched );
            }

            // 多个dom元素
            if ( this.length > 1 ) {
                // Remove duplicates
                // 有可能重复的  就去重
                if ( !guaranteedUnique[ name ] ) {
                    jQuery.unique( matched );
                }

                // Reverse order for parents* and prev-derivatives
                // 调换头尾
                // 某些case
                if ( rparentsprev.test( name ) ) {
                    matched.reverse();
                }
            }

            // 入栈
            return this.pushStack( matched );
        };
    });

    jQuery.extend({
        filter: function( expr, elems, not ) {
            // 取第一个元素
            var elem = elems[ 0 ];

            // 是否是反向选择
            if ( not ) {
                // 包裹一个not选择器
                expr = ":not(" + expr + ")";
            }

            // 如果jq对象只有一个dom元素
            // jQuery.find  Sizzle
            // Sizzle.matchesSelector 筛选单个元素  如果筛选成功 就返回他自己 不成功 就返回空数组
            // Sizzle.matches 筛选多个元素  先过滤本身的元素节点 当做入参  返回值是过滤后的元素
            return elems.length === 1 && elem.nodeType === 1 ?
                jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
                jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
                    return elem.nodeType === 1;
                }));
        },

        // elem 操作的目标元素
        // dir 兼容原生api的属性名
        // until 到某个条件为止
        dir: function( elem, dir, until ) {
            var matched = [],
                truncate = until !== undefined;

            // 过滤到document
            while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
                // 过滤到元素节点
                if ( elem.nodeType === 1 ) {
                    // 如果查找到边界条件 就直接break
                    if ( truncate && jQuery( elem ).is( until ) ) {
                        break;
                    }
                    matched.push( elem );
                }
            }
            return matched;
        },

        // n 第一个兄弟元素
        // elem 本身
        sibling: function( n, elem ) {
            var matched = [];

            // 从第一个兄弟元素 往下找  直到最后
            for ( ; n; n = n.nextSibling ) {
                // 过滤本身
                if ( n.nodeType === 1 && n !== elem ) {
                    matched.push( n );
                }
            }

            return matched;
        }
    });

// Implement the identical functionality for filter and not
//    elements
//    qualifier 筛选条件
    function winnow( elements, qualifier, not ) {
        // 判断条件是否是个函数
        if ( jQuery.isFunction( qualifier ) ) {
            // 函数return true是要保留 false是要过滤
            return jQuery.grep( elements, function( elem, i ) {
                /* jshint -W018 */
                // 回调传参 index 和 元素
                return !!qualifier.call( elem, i, elem ) !== not;
            });

        }

        // 筛选条件如果是个dom元素
        if ( qualifier.nodeType ) {
            // 通过判断dom元素是否想等
            return jQuery.grep( elements, function( elem ) {
                return ( elem === qualifier ) !== not;
            });

        }

        // 字符串选择器
        if ( typeof qualifier === "string" ) {
            // 类选择器 等简单选择器
            if ( isSimple.test( qualifier ) ) {
                return jQuery.filter( qualifier, elements, not );
            }

            // 复杂选择器不能使用  :not(url li) 所以这里不传not
            // 复杂选择器 子选择器 等等
            qualifier = jQuery.filter( qualifier, elements );
        }

        // 过滤not 取反
        return jQuery.grep( elements, function( elem ) {
            return ( core_indexOf.call( qualifier, elem ) >= 0 ) !== not;
        });
    }
    var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        rtagName = /<([\w:]+)/,
        rhtml = /<|&#?\w+;/,
        rnoInnerhtml = /<(?:script|style|link)/i,
        manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
        // checked="checked" or checked
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
        rscriptType = /^$|\/(?:java|ecma)script/i,
        rscriptTypeMasked = /^true\/(.*)/,
        rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

        // We have to close these tags to support XHTML (#13200)
        wrapMap = {

            // Support: IE 9
            option: [ 1, "<select multiple='multiple'>", "</select>" ],

            thead: [ 1, "<table>", "</table>" ],
            col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
            tr: [ 2, "<table><tbody>", "</tbody></table>" ],
            td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

            _default: [ 0, "", "" ]
        };

// Support: IE 9
    wrapMap.optgroup = wrapMap.option;

    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

    jQuery.fn.extend({
        // 当做文本处理  不会获取（过滤标签）  设置（转义标签） 标签
        text: function( value ) {
            return jQuery.access( this, function( value ) {
                return value === undefined ?
                    // Sizzle方法
                    jQuery.text( this ) :
                    // 先清空。然后再添加  创建文本节点
                    this.empty().append( ( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value ) );
            }, null, value, arguments.length );
        },

        // 添加再最后面
        append: function() {
            return this.domManip( arguments, function( elem ) {
                // elem就是生成的要添加的元素
                // this就是当前dom对象
                if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
                    // 兼容 傻逼ie  tr tbody有问题
                    var target = manipulationTarget( this, elem );
                    target.appendChild( elem );
                }
            });
        },

        // 添加再最前面
        prepend: function() {
            return this.domManip( arguments, function( elem ) {
                if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
                    var target = manipulationTarget( this, elem );
                    target.insertBefore( elem, target.firstChild );
                }
            });
        },

        before: function() {
            return this.domManip( arguments, function( elem ) {
                if ( this.parentNode ) {
                    this.parentNode.insertBefore( elem, this );
                }
            });
        },

        after: function() {
            return this.domManip( arguments, function( elem ) {
                if ( this.parentNode ) {
                    // 还是调用insertBefore 只是改变了i下 参考节点
                    this.parentNode.insertBefore( elem, this.nextSibling );
                }
            });
        },

        // keepData is for internal use only--do not document
        // 删除节点
        // selector 过滤条件 符合条件的被删除
        // keepData 从文档中删除的时候 是否需要保留事件、数据缓存
        //
        remove: function( selector, keepData ) {
            var elem,
                // 过滤删除的条件 获得元素
                elems = selector ? jQuery.filter( selector, this ) : this,
                i = 0;

            // 遍历元素
            for ( ; (elem = elems[i]) != null; i++ ) {
                // 元素节点的时候 不保留数据
                if ( !keepData && elem.nodeType === 1 ) {
                    // 把所有子孙节点删除 数据
                    jQuery.cleanData( getAll( elem ) );
                }

                // 判断有没有父元素
                if ( elem.parentNode ) {
                    // script标签处理
                    // 再次添加的时候是否会被执行
                    if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
                        setGlobalEval( getAll( elem, "script" ) );
                    }
                    // 原生api删除
                    elem.parentNode.removeChild( elem );
                }
            }

            return this;
        },

        // 把元素置空 删除所有子元素
        empty: function() {
            var elem,
                i = 0;

            for ( ; (elem = this[i]) != null; i++ ) {
                // 元素
                if ( elem.nodeType === 1 ) {

                    // Prevent memory leaks
                    // 删除数据 事件
                    // getAll( elem, false ) 不包含本身
                    jQuery.cleanData( getAll( elem, false ) );

                    // Remove any remaining nodes
                    // 清空
                    elem.textContent = "";
                }
            }

            return this;
        },

        // 复制节点
        // dataAndEvents        克隆是否包含事件数据
        // deepDataAndEvents    深拷贝子元素的数据
        clone: function( dataAndEvents, deepDataAndEvents ) {
            // 默认值
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            // 第二个参数没有  就使用第一个餐宿
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

            // 调用工具方法
            return this.map( function () {
                return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
            });
        },

        html: function( value ) {
            return jQuery.access( this, function( value ) {
                var elem = this[ 0 ] || {},
                    i = 0,
                    l = this.length;

                // 获取 直接返回innerHTML
                if ( value === undefined && elem.nodeType === 1 ) {
                    return elem.innerHTML;
                }

                // See if we can take a shortcut and just use innerHTML
                // 设置的内容要是字符串   不包含script link style    符合规范的html结构
                if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
                    !wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

                    //
                    value = value.replace( rxhtmlTag, "<$1></$2>" );

                    try {
                        for ( ; i < l; i++ ) {
                            elem = this[ i ] || {};

                            // Remove element nodes and prevent memory leaks
                            // 删除现有的子元素的数据 监听
                            if ( elem.nodeType === 1 ) {
                                jQuery.cleanData( getAll( elem, false ) );
                                elem.innerHTML = value;
                            }
                        }

                        elem = 0;

                        // If using innerHTML throws an exception, use the fallback method
                    } catch( e ) {}
                }

                // 先删除原来的 再添加
                if ( elem ) {
                    this.empty().append( value );
                }
            }, null, value, arguments.length );
        },

        replaceWith: function() {
            var
                // Snapshot the DOM in case .domManip sweeps something relevant into its fragment
                args = jQuery.map( this, function( elem ) {
                    return [ elem.nextSibling, elem.parentNode ];
                }),
                i = 0;

            // Make the changes, replacing each context element with the new content
            this.domManip( arguments, function( elem ) {
                var next = args[ i++ ],
                    parent = args[ i++ ];

                if ( parent ) {
                    // Don't use the snapshot next if it has moved (#13810)
                    if ( next && next.parentNode !== parent ) {
                        next = this.nextSibling;
                    }
                    jQuery( this ).remove();
                    parent.insertBefore( elem, next );
                }
                // Allow new content to include elements from the context set
            }, true );

            // Force removal if there was no new content (e.g., from empty arguments)
            return i ? this : this.remove();
        },

        detach: function( selector ) {
            return this.remove( selector, true );
        },

        // args     要添加的元素
        // callback 回调
        // allowIntersection
        domManip: function( args, callback, allowIntersection ) {

            // Flatten any nested arrays
            // 添加多个 要转成数组
            args = core_concat.apply( [], args );

            var fragment, first, scripts, hasScripts, node, doc,
                i = 0,
                l = this.length,
                set = this,
                iNoClone = l - 1,
                value = args[ 0 ],
                // 第一项是否是函数
                isFunction = jQuery.isFunction( value );

            // We can't cloneNode fragments that contain checked, in WebKit
            // fragments
            if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
                // 循环调用dom元素
                return this.each(function( index ) {
                    var self = set.eq( index );
                    // 如果是个方法就调用一次
                    if ( isFunction ) {
                        // 传参 索引。当前元素的html字符串
                        args[ 0 ] = value.call( this, index, self.html() );
                    }
                    // 递归
                    self.domManip( args, callback, allowIntersection );
                });
            }

            if ( l ) {
                // 创建fragment
                fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, !allowIntersection && this );
                first = fragment.firstChild;

                // 最外层是否有一个标签包裹
                if ( fragment.childNodes.length === 1 ) {
                    fragment = first;
                }

                if ( first ) {
                    // 获取script标签
                    // disableScript 修改script标签的type 就不会被执行了
                    scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
                    // 长度是否为0
                    hasScripts = scripts.length;

                    // Use the original fragment for the last item instead of the first because it can end up
                    // being emptied incorrectly in certain situations (#8070).
                    // 多个节点
                    for ( ; i < l; i++ ) {
                        node = fragment;

                        if ( i !== iNoClone ) {
                            node = jQuery.clone( node, true, true );

                            // Keep references to cloned scripts for later restoration
                            if ( hasScripts ) {
                                // Support: QtWebKit
                                // jQuery.merge because core_push.apply(_, arraylike) throws
                                jQuery.merge( scripts, getAll( node, "script" ) );
                            }
                        }

                        // 调用回调
                        callback.call( this[ i ], node, i );
                    }

                    if ( hasScripts ) {
                        doc = scripts[ scripts.length - 1 ].ownerDocument;

                        // Reenable scripts
                        // 恢复script标签的type  执行script
                        jQuery.map( scripts, restoreScript );

                        // Evaluate executable scripts on first document insertion
                        for ( i = 0; i < hasScripts; i++ ) {
                            node = scripts[ i ];
                            if ( rscriptType.test( node.type || "" ) &&
                                !data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

                                // script  src方式加载
                                if ( node.src ) {
                                    // Hope ajax is available...
                                    jQuery._evalUrl( node.src );
                                } else {
                                    jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
                                }
                            }
                        }
                    }
                }
            }

            return this;
        }
    });

    // 实现效果一样  只是被作用对象 相反
    // 链式调用的时候 作用对象 不同
    jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function( name, original ) {
        jQuery.fn[ name ] = function( selector ) {
            var elems,
                ret = [],
                // 转换成jq对象
                insert = jQuery( selector ),
                last = insert.length - 1,
                i = 0;

            //
            for ( ; i <= last; i++ ) {
                // 最后一个是this  其他的都是克隆
                elems = i === last ? this : this.clone( true );
                jQuery( insert[ i ] )[ original ]( elems );

                // Support: QtWebKit
                // .get() because core_push.apply(_, arraylike) throws
                core_push.apply( ret, elems.get() );
            }

            return this.pushStack( ret );
        };
    });

    jQuery.extend({
        clone: function( elem, dataAndEvents, deepDataAndEvents ) {
            var i, l, srcElements, destElements,
                // 原生api  深拷贝
                clone = elem.cloneNode( true ),
                // iframe
                inPage = jQuery.contains( elem.ownerDocument, elem );

            // Support: IE >= 9
            // Fix Cloning issues
            // 傻逼ie
            if ( !jQuery.support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

                // checkbox radio选中状态 复制的时候问题
                // textarea默认值 复制的时候问题
                // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
                destElements = getAll( clone );
                srcElements = getAll( elem );

                for ( i = 0, l = srcElements.length; i < l; i++ ) {
                    fixInput( srcElements[ i ], destElements[ i ] );
                }
            }

            // Copy the events from the original to the clone
            // 是否要克隆事件
            if ( dataAndEvents ) {
                // 子元素克隆事件
                if ( deepDataAndEvents ) {
                    srcElements = srcElements || getAll( elem );
                    destElements = destElements || getAll( clone );

                    for ( i = 0, l = srcElements.length; i < l; i++ ) {
                        cloneCopyEvent( srcElements[ i ], destElements[ i ] );
                    }
                } else {
                    cloneCopyEvent( elem, clone );
                }
            }

            // Preserve script evaluation history
            // script标签
            destElements = getAll( clone, "script" );
            if ( destElements.length > 0 ) {
                // 拷贝script设置成全局的  再添加到文本中的时候 就不再执行了
                setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
            }

            // Return the cloned set
            return clone;
        },

        buildFragment: function( elems, context, scripts, selection ) {
            var elem, tmp, tag, wrap, contains, j,
                i = 0,
                l = elems.length,
                // 原生api创建fragment
                fragment = context.createDocumentFragment(),
                nodes = [];

            for ( ; i < l; i++ ) {
                elem = elems[ i ];

                if ( elem || elem === 0 ) {

                    // Add nodes directly
                    if ( jQuery.type( elem ) === "object" ) {
                        // dom jq对象
                        // Support: QtWebKit
                        // jQuery.merge because core_push.apply(_, arraylike) throws
                        // 原生对象就组成数组
                        jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

                        // Convert non-html into a text node
                    } else if ( !rhtml.test( elem ) ) {
                        // 存文本节点  没有html标签
                        nodes.push( context.createTextNode( elem ) );

                        // Convert html into DOM nodes
                    } else {
                        // 创建div
                        tmp = tmp || fragment.appendChild( context.createElement("div") );

                        // Deserialize a standard representation
                        tag = ( rtagName.exec( elem ) || ["", ""] )[ 1 ].toLowerCase();
                        // xhtml
                        wrap = wrapMap[ tag ] || wrapMap._default;
                        tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

                        // Descend through wrappers to the right content
                        j = wrap[ 0 ];
                        while ( j-- ) {
                            tmp = tmp.lastChild;
                        }

                        // Support: QtWebKit
                        // jQuery.merge because core_push.apply(_, arraylike) throws
                        jQuery.merge( nodes, tmp.childNodes );

                        // Remember the top-level container
                        tmp = fragment.firstChild;

                        // Fixes #12346
                        // Support: Webkit, IE
                        tmp.textContent = "";
                    }
                }
            }

            // Remove wrapper from fragment
            // nodes构建完毕，清空fragment
            fragment.textContent = "";

            i = 0;
            while ( (elem = nodes[ i++ ]) ) {

                // #4087 - If origin and destination elements are the same, and this is
                // that element, do not do anything
                if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
                    continue;
                }

                contains = jQuery.contains( elem.ownerDocument, elem );

                // Append to fragment
                tmp = getAll( fragment.appendChild( elem ), "script" );

                // Preserve script evaluation history
                if ( contains ) {
                    setGlobalEval( tmp );
                }

                // Capture executables
                if ( scripts ) {
                    j = 0;
                    while ( (elem = tmp[ j++ ]) ) {
                        if ( rscriptType.test( elem.type || "" ) ) {
                            scripts.push( elem );
                        }
                    }
                }
            }

            return fragment;
        },

        cleanData: function( elems ) {
            var data, elem, events, type, key, j,
                special = jQuery.event.special,
                i = 0;

            for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
                // 获取缓存数据
                if ( Data.accepts( elem ) ) {
                    key = elem[ data_priv.expando ];

                    if ( key && (data = data_priv.cache[ key ]) ) {
                        // 如果有事件
                        events = Object.keys( data.events || {} );
                        if ( events.length ) {
                            // 循环调用remove
                            for ( j = 0; (type = events[j]) !== undefined; j++ ) {
                                if ( special[ type ] ) {
                                    jQuery.event.remove( elem, type );

                                    // This is a shortcut to avoid jQuery.event.remove's overhead
                                } else {
                                    jQuery.removeEvent( elem, type, data.handle );
                                }
                            }
                        }

                        // jq级别的私有缓存
                        if ( data_priv.cache[ key ] ) {
                            // Discard any remaining `private` data
                            delete data_priv.cache[ key ];
                        }
                    }
                }
                // Discard any remaining `user` data
                // 用户设置的 删除缓存
                delete data_user.cache[ elem[ data_user.expando ] ];
            }
        },

        // 调用ajax 下载scritp
        _evalUrl: function( url ) {
            return jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "script",
                async: false,
                global: false,
                "throws": true
            });
        }
    });

// Support: 1.x compatibility
// Manipulating tables requires a tbody
    function manipulationTarget( elem, content ) {
        // 往table下面添加tr
        return jQuery.nodeName( elem, "table" ) &&
        jQuery.nodeName( content.nodeType === 1 ? content : content.firstChild, "tr" ) ?

            elem.getElementsByTagName("tbody")[0] ||
            elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
            elem;
    }

// Replace/restore the type attribute of script elements for safe DOM manipulation
    function disableScript( elem ) {
        elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
        return elem;
    }
    function restoreScript( elem ) {
        var match = rscriptTypeMasked.exec( elem.type );

        if ( match ) {
            elem.type = match[ 1 ];
        } else {
            elem.removeAttribute("type");
        }

        return elem;
    }

// Mark scripts as having already been evaluated
    function setGlobalEval( elems, refElements ) {
        var l = elems.length,
            i = 0;

        for ( ; i < l; i++ ) {
            // 私有数据缓存
            // 没有 refElements 就设置成true
            data_priv.set(
                elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
            );
        }
    }

    function cloneCopyEvent( src, dest ) {
        var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

        if ( dest.nodeType !== 1 ) {
            return;
        }

        // 1. Copy private data: events, handlers, etc.
        if ( data_priv.hasData( src ) ) {
            pdataOld = data_priv.access( src );
            pdataCur = data_priv.set( dest, pdataOld );
            events = pdataOld.events;

            // 事件 重新add
            if ( events ) {
                delete pdataCur.handle;
                pdataCur.events = {};

                for ( type in events ) {
                    for ( i = 0, l = events[ type ].length; i < l; i++ ) {
                        jQuery.event.add( dest, type, events[ type ][ i ] );
                    }
                }
            }
        }

        // 2. Copy user data
        // 用户设置的数据
        if ( data_user.hasData( src ) ) {
            udataOld = data_user.access( src );
            udataCur = jQuery.extend( {}, udataOld );

            data_user.set( dest, udataCur );
        }
    }


    // tag 指定表签名
    // tag false 不包含本身
    function getAll( context, tag ) {
        // 调用原生api获得所有的子节点 孙节点
        var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
            context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
                [];

        // 合并到本身
        return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
            jQuery.merge( [ context ], ret ) :
            ret;
    }

// Support: IE >= 9
    function fixInput( src, dest ) {
        var nodeName = dest.nodeName.toLowerCase();

        // Fails to persist the checked state of a cloned checkbox or radio button.
        if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
            dest.checked = src.checked;

            // Fails to return the selected option to the default selected state when cloning options
        } else if ( nodeName === "input" || nodeName === "textarea" ) {
            dest.defaultValue = src.defaultValue;
        }
    }
    // 包装
    jQuery.fn.extend({
        // 对当前jq对象所有的dom外 添加一层html标签包裹 可能会影响结构
        wrapAll: function( html ) {
            var wrap;

            // 可以传入一个函数
            // 这样不能整体包裹
            if ( jQuery.isFunction( html ) ) {
                // 一样的操作
                return this.each(function( i ) {
                    jQuery( this ).wrapAll( html.call(this, i) );
                });
            }

            // 第一个元素
            if ( this[ 0 ] ) {

                // The elements to wrap the target around
                // 根据传入的html创建一个jq对象 取第一个（传并列多个没用） 然后克隆
                wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

                // 重新插入
                // 这个时候还是一个空节点
                if ( this[ 0 ].parentNode ) {
                    wrap.insertBefore( this[ 0 ] );
                }

                // 有可能 传入的html也是有层级的
                // 添加
                wrap.map(function() {
                    var elem = this;

                    while ( elem.firstElementChild ) {
                        elem = elem.firstElementChild;
                    }

                    return elem;
                }).append( this );
            }

            return this;
        },

        // 把dom元素下所有的子节点 包装一层
        wrapInner: function( html ) {
            if ( jQuery.isFunction( html ) ) {
                return this.each(function( i ) {
                    jQuery( this ).wrapInner( html.call(this, i) );
                });
            }

            return this.each(function() {
                var self = jQuery( this ),
                    // 所有的子元素
                    contents = self.contents();

                if ( contents.length ) {
                    // 包子元素  就相当于 在里面包
                    contents.wrapAll( html );

                } else {
                    // 没有子元素  就添加可以
                    self.append( html );
                }
            });
        },

        // 对传入的节点外面包装一层 html节点
        wrap: function( html ) {
            var isFunction = jQuery.isFunction( html );

            // 遍历调用wrapAll
            return this.each(function( i ) {
                jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
            });
        },

        // 删除一个父级 不删除本身
        unwrap: function() {
            // 遍历父级
            // 出栈
            return this.parent().each(function() {
                // 不是body 替换
                if ( !jQuery.nodeName( this, "body" ) ) {
                    jQuery( this ).replaceWith( this.childNodes );
                }
            }).end();
        }
    });
    // todo css()方法 样式的操作
    var curCSS, iframe,
        // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
        // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
        rdisplayswap = /^(none|table(?!-c[ea]).+)/,
        rmargin = /^margin/,
        rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
        rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
        rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
        elemdisplay = { BODY: "block" },

        cssShow = { position: "absolute", visibility: "hidden", display: "block" },
        cssNormalTransform = {
            letterSpacing: 0,
            fontWeight: 400
        },

        cssExpand = [ "Top", "Right", "Bottom", "Left" ],
        cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property\
//    添加样式前缀
    function vendorPropName( style, name ) {

        // shortcut for names that are not vendor prefixed
        // 当前的style对象如果有这个属性就直接返回
        if ( name in style ) {
            return name;
        }

        // check for vendor prefixed names
        // 头字母转大写
        var capName = name.charAt(0).toUpperCase() + name.slice(1),
            origName = name,
            i = cssPrefixes.length;

        // 遍历前缀数组
        while ( i-- ) {
            // 拼接然后查询 如果有 就返回
            name = cssPrefixes[ i ] + capName;
            if ( name in style ) {
                return name;
            }
        }

        // 最后再style对象中没有  还返回原来的
        return origName;
    }

    // 判断是否因此
    function isHidden( elem, el ) {
        // isHidden might be called from jQuery#filter function;
        // in that case, element will be second argument
        elem = el || elem;
        // display none 就是隐藏
        // 不再document中就是隐藏
        return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
    }

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
//    style.xxx 可以获取复合样式 border: 1px solid red   只能获取行内样式
    function getStyles( elem ) {
        // 获取元素的最终样式 ， 不但有行内样式 也能根据计算完成的优先级获取css设置的样式  不能获取复合样式
        return window.getComputedStyle( elem, null );
    }

    // 显示 隐藏元素
    function showHide( elements, show ) {
        var display, elem, hidden,
            values = [],
            index = 0,
            length = elements.length;

        for ( ; index < length; index++ ) {
            elem = elements[ index ];
            // 没有style 可能不是 元素
            if ( !elem.style ) {
                continue;
            }

            // 通过数据缓存获取 之前设置的display内容
            values[ index ] = data_priv.get( elem, "olddisplay" );
            // 获取现在的display值
            display = elem.style.display;
            if ( show ) {
                // Reset the inline display of this element to learn if it is
                // being hidden by cascaded rules or not
                // 之前缓存中没有存值 要去显示 就把display设置成空字符串
                if ( !values[ index ] && display === "none" ) {
                    elem.style.display = "";
                }

                // Set elements which have been overridden with display: none
                // in a stylesheet to whatever the default browser style is
                // for such an element
                // 现在是空字符串 并且是要隐藏
                if ( elem.style.display === "" && isHidden( elem ) ) {
                    // 元素的默认display值 存在缓存中
                    values[ index ] = data_priv.access( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
                }
            } else {
                // 要去隐藏

                // 没有设置过缓存
                if ( !values[ index ] ) {
                    hidden = isHidden( elem );

                    // 现在是不是隐藏的 要存一下现在的显示状态
                    if ( display && display !== "none" || !hidden ) {
                        data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css(elem, "display") );
                    }
                }
            }
        }

        // Set the display of most of the elements in a second loop
        // to avoid the constant reflow
        for ( index = 0; index < length; index++ ) {
            elem = elements[ index ];
            if ( !elem.style ) {
                continue;
            }
            //
            if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
                // 要显示就设置成原来的显示状态
                // 隐藏就设置成none
                elem.style.display = show ? values[ index ] || "" : "none";
            }
        }

        return elements;
    }

    jQuery.fn.extend({
        css: function( name, value ) {
            return jQuery.access( this, function( elem, name, value ) {
                var styles, len,
                    map = {},
                    i = 0;

                if ( jQuery.isArray( name ) ) {
                    styles = getStyles( elem );
                    len = name.length;

                    for ( ; i < len; i++ ) {
                        map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
                    }

                    return map;
                }

                return value !== undefined ?
                    jQuery.style( elem, name, value ) :
                    jQuery.css( elem, name );
            }, name, value, arguments.length > 1 );
        },
        // 下面三个方法最终调用showHide 修改显示状态
        show: function() {
            return showHide( this, true );
        },
        hide: function() {
            return showHide( this );
        },
        toggle: function( state ) {
            if ( typeof state === "boolean" ) {
                return state ? this.show() : this.hide();
            }

            return this.each(function() {
                if ( isHidden( this ) ) {
                    jQuery( this ).show();
                } else {
                    jQuery( this ).hide();
                }
            });
        }
    });

    jQuery.extend({
        // Add in style property hooks for overriding the default
        // behavior of getting and setting a style property
        cssHooks: {
            // 透明度没有就是返回1
            opacity: {
                get: function( elem, computed ) {
                    if ( computed ) {
                        // We should always get a number back from opacity
                        var ret = curCSS( elem, "opacity" );
                        return ret === "" ? "1" : ret;
                    }
                }
            }
        },

        // Don't automatically add "px" to these possibly-unitless properties
        cssNumber: {
            "columnCount": true,
            "fillOpacity": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "order": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
        },

        // Add in properties whose names you wish to fix before
        // setting or getting the value
        cssProps: {
            // 浮动的转换
            // float浮点数 浮动 有问题 所以用cssFloat  class  className
            // normalize float css property
            "float": "cssFloat"
        },

        // Get and set the style property on a DOM Node
        // elem     要设置给哪个元素
        // name     样式的键
        // value    样式的值
        // elem     尺寸方法 content/padding/border/margin
        //                  width innerwidth outerwidth outerwidth( true)
        style: function( elem, name, value, extra ) {
            // Don't set styles on text and comment nodes
            // 对元素节点才能操作
            if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
                return;
            }

            // Make sure that we're working with the right name
            var ret, type, hooks,
                origName = jQuery.camelCase( name ),
                style = elem.style;

            // 切换成对js中能设置的变量名
            name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

            // gets hook for the prefixed version
            // followed by the unprefixed version
            // hooks
            hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

            // Check if we're setting a value
            // 要设置值
            if ( value !== undefined ) {
                type = typeof value;

                // convert relative number strings (+= or -=) to relative numbers. #7345
                // 设置值的时候可以用 += -=  再当前值的基础上 继续操作
                if ( type === "string" && (ret = rrelNum.exec( value )) ) {
                    // 先调用css获取先有的值  然后计算
                    value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
                    // Fixes bug #9237
                    // 修改上面typeof获取的值
                    type = "number";
                }

                // Make sure that NaN and null values aren't set. See: #7116
                // 转换失败 就没办法了
                if ( value == null || type === "number" && isNaN( value ) ) {
                    return;
                }

                // If a number was passed in, add 'px' to the (except for certain CSS properties)
                // 如果当前属性对应的是number值就加上px
                if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
                    value += "px";
                }

                // Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
                // but it would mean to define eight (for every problematic property) identical functions
                // 兼容 克隆之间的值会有影响
                if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
                    style[ name ] = "inherit";
                }

                // If a hook was provided, use that value, otherwise just set the specified value
                // 有hook调用hook设置
                if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
                    // 没有hook就直接赋值
                    style[ name ] = value;
                }

            } else {
                // 要获取值
                // If a hook was provided get the non-computed value from there
                // 有hooks走hooks
                if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
                    return ret;
                }

                // Otherwise just get the value from the style object
                // 没有hooks从style中直接取
                return style[ name ];
            }
        },

        // 获取
        // styles 一次获取多个样式值的时候 getComputedStyle的返回值 后面有循环 直接传入了 不用多次获取
        css: function( elem, name, extra, styles ) {
            var val, num, hooks,
                // 转驼峰
                origName = jQuery.camelCase( name );

            // Make sure that we're working with the right name
            // 如果cssProps有就直接取  没有就调用vendorPropName添加前缀找 找到了就放在cssProps缓存
            name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

            // gets hook for the prefixed version
            // followed by the unprefixed version
            // 补丁
            hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

            // If a hook was provided get the computed value from there
            // 获取hooks中的属性
            if ( hooks && "get" in hooks ) {
                val = hooks.get( elem, true, extra );
            }

            // Otherwise, if a way to get the computed value exists, use that
            // 没有hooks
            if ( val === undefined ) {
                // 获取计算后的样式对象
                val = curCSS( elem, name, styles );
            }

            //convert "normal" to computed value
            // 返回的是normal  如fontWeight
            if ( val === "normal" && name in cssNormalTransform ) {
                // 转换成数字
                val = cssNormalTransform[ name ];
            }

            // Return, converting to number if forced or a qualifier was provided and val looks numeric
            // 计算尺寸
            if ( extra === "" || extra ) {
                // 过滤单位
                num = parseFloat( val );
                return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
            }
            return val;
        }
    });

    // 获取
    curCSS = function( elem, name, _computed ) {
        var width, minWidth, maxWidth,
            // getComputedStyle的返回结果
            computed = _computed || getStyles( elem ),

            // Support: IE9
            // getPropertyValue is only needed for .css('filter') in IE9, see #12537
            // 从结果中直接取到要获取的样式
            ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
            style = elem.style;

        if ( computed ) {

            // 没有获取到样式  并且   不再document中（游离节点）
            if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
                // 调用静态方法获取结果
                ret = jQuery.style( elem, name );
            }

            // Support: Safari 5.1
            // A tribute to the "awesome hack by Dean Edwards"
            // Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
            // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
            // 检测margin 换算N%为Npx
            if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

                // Remember the original values
                width = style.width;
                minWidth = style.minWidth;
                maxWidth = style.maxWidth;

                // Put in the new values to get a computed value out
                style.minWidth = style.maxWidth = style.width = ret;
                ret = computed.width;

                // Revert the changed values
                style.width = width;
                style.minWidth = minWidth;
                style.maxWidth = maxWidth;
            }
        }

        return ret;
    };


    function setPositiveNumber( elem, value, subtract ) {
        //subtract 传入的差值

        var matches = rnumsplit.exec( value );
        return matches ?
            // Guard against undefined "subtract", e.g., when used as in cssHooks
            // 最小值减到0
            // 默认单位ox
            Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
            value;
    }

    function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
        var i = extra === ( isBorderBox ? "border" : "content" ) ?
            // If we already have the right measurement, avoid augmentation
            4 :
            // Otherwise initialize for horizontal or vertical properties

            // name width 1 height 0  后面for循环中 i高取0 2 宽取1 3
            // cssExpand = [ "Top", "Right", "Bottom", "Left" ],
            name === "width" ? 1 : 0,

            val = 0;

        // 调用css获取相对应的 padding/margin/border  然后相加减
        for ( ; i < 4; i += 2 ) {
            // both box models exclude margin, so add it if we want it
            if ( extra === "margin" ) {
                // 拼接键 获取margin 然后值想加
                val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
            }

            if ( isBorderBox ) {
                // border-box includes padding, so remove it if we want content
                if ( extra === "content" ) {
                    val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
                }

                // at this point, extra isn't border nor margin, so remove border
                if ( extra !== "margin" ) {
                    val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
                }
            } else {
                // at this point, extra isn't content, so add padding
                val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

                // at this point, extra isn't content nor padding, so add border
                if ( extra !== "padding" ) {
                    val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
                }
            }
        }

        return val;
    }

    function getWidthOrHeight( elem, name, extra ) {

        // Start with offset property, which is equivalent to the border-box value
        var valueIsBorderBox = true,
            // 原生api 获取宽高
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            styles = getStyles( elem ),
            // 是否设置了boxSizing
            isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

        // some non-html elements return undefined for offsetWidth, so check for null/undefined
        // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
        // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
        // offsetWidth没获取成功 svg的时候
        if ( val <= 0 || val == null ) {
            // Fall back to computed then uncomputed css if necessary
            // computedStyle获取
            val = curCSS( elem, name, styles );
            if ( val < 0 || val == null ) {
                // 行内样式获取
                val = elem.style[ name ];
            }

            // Computed unit is not pixels. Stop here and return.
            if ( rnumnonpx.test(val) ) {
                return val;
            }

            // we need the check for style in case a browser which returns unreliable values
            // for getComputedStyle silently falls back to the reliable elem.style
            valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

            // Normalize "", auto, and prepare for extra
            val = parseFloat( val ) || 0;
        }

        // use the active box-sizing model to add/subtract irrelevant styles
        return ( val +
            //    计算是否要加 padding/border/margin
            augmentWidthOrHeight(
                elem,
                name,
                extra || ( isBorderBox ? "border" : "content" ),
                valueIsBorderBox,
                styles
            )
        ) + "px";
    }

// Try to determine the default display value of an element
    function css_defaultDisplay( nodeName ) {
        var doc = document,
            // 缓存中取得默认的显示状态
            display = elemdisplay[ nodeName ];

        // 如果没有
        if ( !display ) {
            // 调用检测
            display = actualDisplay( nodeName, doc );

            // If the simple way fails, read from inside an iframe
            // 如果检测失败 iframe隐藏 里面的所有元素也是none
            if ( display === "none" || !display ) {
                // Use the already-created iframe if possible
                // 用iframe检测
                iframe = ( iframe ||
                    jQuery("<iframe frameborder='0' width='0' height='0'/>")
                        .css( "cssText", "display:block !important" )
                ).appendTo( doc.documentElement );

                // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
                doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
                doc.write("<!doctype html><html><body>");
                doc.close();

                display = actualDisplay( nodeName, doc );
                iframe.detach();
            }

            // Store the correct default display
            // 缓存一下
            elemdisplay[ nodeName ] = display;
        }

        return display;
    }

// Called ONLY from within css_defaultDisplay
    function actualDisplay( name, doc ) {
        // 创建节点 添加到body上
        var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
            // 然后通过css获取display值
            display = jQuery.css( elem[0], "display" );
        // 删除元素
        elem.remove();
        return display;
    }

    jQuery.each([ "height", "width" ], function( i, name ) {
        jQuery.cssHooks[ name ] = {
            //
            get: function( elem, computed, extra ) {
                if ( computed ) {
                    // certain elements can have dimension info if we invisibly show them
                    // however, it must have a current display style that would benefit from this
                    // 获取的宽高是0  是隐藏的
                    return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
                        // 隐藏元素无法获取宽高  这样可以获取到
                        jQuery.swap( elem, cssShow, function() {
                            return getWidthOrHeight( elem, name, extra );
                        }) :
                        // 计算出宽高
                        getWidthOrHeight( elem, name, extra );
                }
            },

            set: function( elem, value, extra ) {
                var styles = extra && getStyles( elem );
                return setPositiveNumber( elem, value, extra ?
                    augmentWidthOrHeight(
                        elem,
                        name,
                        extra,
                        jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
                        styles
                    ) : 0
                );
            }
        };
    });

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
//    加绒
    jQuery(function() {
        // Support: Android 2.3
        if ( !jQuery.support.reliableMarginRight ) {
            jQuery.cssHooks.marginRight = {
                get: function( elem, computed ) {
                    if ( computed ) {
                        // Support: Android 2.3
                        // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                        // Work around by temporarily setting element display to inline-block
                        return jQuery.swap( elem, { "display": "inline-block" },
                            curCSS, [ elem, "marginRight" ] );
                    }
                }
            };
        }

        // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
        // getComputedStyle returns percent when specified for top/left/bottom/right
        // rather than make the css module depend on the offset module, we just check for it here
        // 定位 百分比
        if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
            jQuery.each( [ "top", "left" ], function( i, prop ) {
                jQuery.cssHooks[ prop ] = {
                    get: function( elem, computed ) {
                        if ( computed ) {
                            computed = curCSS( elem, prop );
                            // if curCSS returns percentage, fallback to offset
                            return rnumnonpx.test( computed ) ?
                                jQuery( elem ).position()[ prop ] + "px" :
                                computed;
                        }
                    }
                };
            });
        }

    });

    // sizzle扩展
    // 判断元素是否隐藏 :hidde
    if ( jQuery.expr && jQuery.expr.filters ) {
        jQuery.expr.filters.hidden = function( elem ) {
            // Support: Opera <= 12.12
            // Opera reports offsetWidths and offsetHeights less than zero on some elements
            return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
        };

        jQuery.expr.filters.visible = function( elem ) {
            return !jQuery.expr.filters.hidden( elem );
        };
    }

// These hooks are used by animate to expand properties
    jQuery.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function( prefix, suffix ) {
        // 动画的时候 比如 对margin一起设置四个值
        //
        jQuery.cssHooks[ prefix + suffix ] = {
            expand: function( value ) {
                var i = 0,
                    expanded = {},

                    // assumes a single number if not a string
                    parts = typeof value === "string" ? value.split(" ") : [ value ];

                for ( ; i < 4; i++ ) {
                    expanded[ prefix + cssExpand[ i ] + suffix ] =
                        parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
                }

                return expanded;
            }
        };

        if ( !rmargin.test( prefix ) ) {
            jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
        }
    });
    // todo 提交数据 和 ajax
    var r20 = /%20/g,
        rbracket = /\[\]$/,
        rCRLF = /\r?\n/g,
        rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
        rsubmittable = /^(?:input|select|textarea|keygen)/i;

    jQuery.fn.extend({
        // 表单序列化
        // 把表单内的 name value拼接成字符串
        serialize: function() {
            // 把对象传进param 中获取字符串
            return jQuery.param( this.serializeArray() );
        },
        // 把表单内的 name value拼接成对象
        serializeArray: function() {
            // 遍历元素
            return this.map(function(){
                // Can add propHook for "elements" to filter or add form elements
                // 找到elements属性 只有form有   是表单内的所有元素
                var elements = jQuery.prop( this, "elements" );
                // 转数组
                // 没有elements 就返回本身
                return elements ? jQuery.makeArray( elements ) : this;
            })
                .filter(function(){
                    // 过滤 有名称 没有禁用  排除没有name的元素 必须要有name的元素  checkbox、radio 选中的时候
                    var type = this.type;
                    // Use .is(":disabled") so that fieldset[disabled] works
                    return this.name && !jQuery( this ).is( ":disabled" ) &&
                        rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
                        ( this.checked || !manipulation_rcheckableType.test( type ) );
                })
                .map(function( i, elem ){
                    // 获取元素的value
                    var val = jQuery( this ).val();

                    return val == null ?
                        null :
                        // 是个数组
                        jQuery.isArray( val ) ?
                            // 遍历数组 构建对象 返回的也是一个数组
                            jQuery.map( val, function( val ){
                                return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
                            }) :
                            // 非数组 就直接构建对象
                            { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
                //    转成普通对象
                }).get();
        }
    });

//Serialize an array of form elements or a set of
//key/values into a query string
//    把对象转换成 &= 拼接的url
//    a 要转换的对象
//    traditional 经典模式
    jQuery.param = function( a, traditional ) {
        var prefix,
            s = [],
            add = function( key, value ) {
                // If value is a function, invoke it and return its value
                // value是方法就调用 取返回值  为空默认空字符串
                value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
                // 编码 然后添加在数组中
                s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
            };

        // Set traditional to true for jQuery <= 1.3.2 behavior.
        if ( traditional === undefined ) {
            // 不传 默认的设置
            traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
        }

        // If an array was passed in, assume that it is an array of form elements.
        if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
            // jq对象 或者 数组 其中是对name  value特殊处理 表单提交
            // .name当做键  .value当做值
            // Serialize the form elements
            // 遍历数组 存在s中
            jQuery.each( a, function() {
                add( this.name, this.value );
            });

        } else {
            // If traditional, encode the "old" way (the way 1.3.2 or older
            // did it), otherwise encode params recursively.
            // 遍历对象
            // add方法中对s数组操作的
            for ( prefix in a ) {
                buildParams( prefix, a[ prefix ], traditional, add );
            }
        }

        // Return the resulting serialization
        // 把数组中元素通过&拼接 替换编码后的空格为+（接收的问题）
        return s.join( "&" ).replace( r20, "+" );
    };

    function buildParams( prefix, obj, traditional, add ) {
        var name;

        if ( jQuery.isArray( obj ) ) {
            // Serialize array item.
            // 数组
            jQuery.each( obj, function( i, v ) {
                // 传统方式直接掉哦那个add   key的内容带有[]
                if ( traditional || rbracket.test( prefix ) ) {
                    // Treat each array item as a scalar.
                    add( prefix, v );

                } else {
                    // 正常情况 参数拼接 key[]
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
                }
            });

        } else if ( !traditional && jQuery.type( obj ) === "object" ) {
            // Serialize object item.
            // 非传统模式 是个对象
            for ( name in obj ) {
                // 拼接key[]
                buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
            }

        } else {
            // Serialize scalar item.
            // 简单数据类型
            add( prefix, obj );
        }
    }
    // 事件相关
    // 遍历所有的时间名
    jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
        "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
        "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

        // Handle event binding
        // 把每个时间名都添加到 原型上
        jQuery.fn[ name ] = function( data, fn ) {
            // 根据参数长度 选择调用 on  trigger
            return arguments.length > 0 ?
                this.on( name, null, data, fn ) :
                this.trigger( name );
        };
    });

    // 扩展原型 实际上也是调用 on off trigger
    jQuery.fn.extend({
        // 鼠标进入 移出的事件调用
        hover: function( fnOver, fnOut ) {
            // 如果移出没有传fnOut 就还用fnOver
            return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
        },

        bind: function( types, data, fn ) {
            return this.on( types, null, data, fn );
        },
        unbind: function( types, fn ) {
            return this.off( types, null, fn );
        },

        // 委托的时候 改变参数位置 然后调用on
        delegate: function( selector, types, data, fn ) {
            return this.on( types, selector, data, fn );
        },
        undelegate: function( selector, types, fn ) {
            // ( namespace ) or ( selector, types [, fn] )
            return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
        }
    });
    var
        // Document location
        ajaxLocParts,
        ajaxLocation,

        ajax_nonce = jQuery.now(),

        ajax_rquery = /\?/,
        rhash = /#.*$/,
        rts = /([?&])_=[^&]*/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
        // #7653, #8125, #8152: local protocol detection
        rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        rnoContent = /^(?:GET|HEAD)$/,
        rprotocol = /^\/\//,
        rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

        // Keep a copy of the old load method
        _load = jQuery.fn.load,

        /* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
        prefilters = {},

        /* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
        transports = {},

        // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
        allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
    try {
        ajaxLocation = location.href;
    } catch( e ) {
        // Use the href attribute of an A element
        // since IE will modify it given document.location
        ajaxLocation = document.createElement( "a" );
        ajaxLocation.href = "";
        ajaxLocation = ajaxLocation.href;
    }

// Segment location into parts
    ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
    function addToPrefiltersOrTransports( structure ) {

        // dataTypeExpression is optional and defaults to "*"
        return function( dataTypeExpression, func ) {

            if ( typeof dataTypeExpression !== "string" ) {
                func = dataTypeExpression;
                dataTypeExpression = "*";
            }

            var dataType,
                i = 0,
                dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

            if ( jQuery.isFunction( func ) ) {
                // For each dataType in the dataTypeExpression
                while ( (dataType = dataTypes[i++]) ) {
                    // Prepend if requested
                    if ( dataType[0] === "+" ) {
                        dataType = dataType.slice( 1 ) || "*";
                        (structure[ dataType ] = structure[ dataType ] || []).unshift( func );

                        // Otherwise append
                    } else {
                        (structure[ dataType ] = structure[ dataType ] || []).push( func );
                    }
                }
            }
        };
    }

// Base inspection function for prefilters and transports
    function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

        var inspected = {},
            seekingTransport = ( structure === transports );

        function inspect( dataType ) {
            var selected;
            inspected[ dataType ] = true;
            jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
                var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
                if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
                    options.dataTypes.unshift( dataTypeOrTransport );
                    inspect( dataTypeOrTransport );
                    return false;
                } else if ( seekingTransport ) {
                    return !( selected = dataTypeOrTransport );
                }
            });
            return selected;
        }

        return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
    }

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
    function ajaxExtend( target, src ) {
        var key, deep,
            flatOptions = jQuery.ajaxSettings.flatOptions || {};

        for ( key in src ) {
            if ( src[ key ] !== undefined ) {
                ( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
            }
        }
        if ( deep ) {
            jQuery.extend( true, target, deep );
        }

        return target;
    }

    jQuery.fn.load = function( url, params, callback ) {
        if ( typeof url !== "string" && _load ) {
            return _load.apply( this, arguments );
        }

        var selector, type, response,
            self = this,
            off = url.indexOf(" ");

        if ( off >= 0 ) {
            selector = url.slice( off );
            url = url.slice( 0, off );
        }

        // If it's a function
        if ( jQuery.isFunction( params ) ) {

            // We assume that it's the callback
            callback = params;
            params = undefined;

            // Otherwise, build a param string
        } else if ( params && typeof params === "object" ) {
            type = "POST";
        }

        // If we have elements to modify, make the request
        if ( self.length > 0 ) {
            jQuery.ajax({
                url: url,

                // if "type" variable is undefined, then "GET" method will be used
                type: type,
                dataType: "html",
                data: params
            }).done(function( responseText ) {

                // Save response for use in complete callback
                response = arguments;

                self.html( selector ?

                    // If a selector was specified, locate the right elements in a dummy div
                    // Exclude scripts to avoid IE 'Permission Denied' errors
                    jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

                    // Otherwise use the full result
                    responseText );

            }).complete( callback && function( jqXHR, status ) {
                self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
            });
        }

        return this;
    };

// Attach a bunch of functions for handling common AJAX events
    jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
        jQuery.fn[ type ] = function( fn ){
            return this.on( type, fn );
        };
    });

    jQuery.extend({

        // Counter for holding the number of active queries
        active: 0,

        // Last-Modified header cache for next request
        lastModified: {},
        etag: {},

        ajaxSettings: {
            url: ajaxLocation,
            type: "GET",
            isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
            global: true,
            processData: true,
            async: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            /*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

            accepts: {
                "*": allTypes,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },

            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },

            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },

            // Data converters
            // Keys separate source (or catchall "*") and destination types with a single space
            converters: {

                // Convert anything to text
                "* text": String,

                // Text to html (true = no transformation)
                "text html": true,

                // Evaluate text as a json expression
                "text json": jQuery.parseJSON,

                // Parse text as xml
                "text xml": jQuery.parseXML
            },

            // For options that shouldn't be deep extended:
            // you can add your own custom options here if
            // and when you create one that shouldn't be
            // deep extended (see ajaxExtend)
            flatOptions: {
                url: true,
                context: true
            }
        },

        // Creates a full fledged settings object into target
        // with both ajaxSettings and settings fields.
        // If target is omitted, writes into ajaxSettings.
        ajaxSetup: function( target, settings ) {
            return settings ?

                // Building a settings object
                ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

                // Extending ajaxSettings
                ajaxExtend( jQuery.ajaxSettings, target );
        },

        ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
        ajaxTransport: addToPrefiltersOrTransports( transports ),

        // Main method
        ajax: function( url, options ) {

            // If url is an object, simulate pre-1.5 signature
            if ( typeof url === "object" ) {
                options = url;
                url = undefined;
            }

            // Force options to be an object
            options = options || {};

            var transport,
                // URL without anti-cache param
                cacheURL,
                // Response headers
                responseHeadersString,
                responseHeaders,
                // timeout handle
                timeoutTimer,
                // Cross-domain detection vars
                parts,
                // To know if global events are to be dispatched
                fireGlobals,
                // Loop variable
                i,
                // Create the final options object
                s = jQuery.ajaxSetup( {}, options ),
                // Callbacks context
                callbackContext = s.context || s,
                // Context for global events is callbackContext if it is a DOM node or jQuery collection
                globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
                    jQuery( callbackContext ) :
                    jQuery.event,
                // Deferreds
                deferred = jQuery.Deferred(),
                completeDeferred = jQuery.Callbacks("once memory"),
                // Status-dependent callbacks
                statusCode = s.statusCode || {},
                // Headers (they are sent all at once)
                requestHeaders = {},
                requestHeadersNames = {},
                // The jqXHR state
                state = 0,
                // Default abort message
                strAbort = "canceled",
                // Fake xhr
                jqXHR = {
                    readyState: 0,

                    // Builds headers hashtable if needed
                    getResponseHeader: function( key ) {
                        var match;
                        if ( state === 2 ) {
                            if ( !responseHeaders ) {
                                responseHeaders = {};
                                while ( (match = rheaders.exec( responseHeadersString )) ) {
                                    responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
                                }
                            }
                            match = responseHeaders[ key.toLowerCase() ];
                        }
                        return match == null ? null : match;
                    },

                    // Raw string
                    getAllResponseHeaders: function() {
                        return state === 2 ? responseHeadersString : null;
                    },

                    // Caches the header
                    setRequestHeader: function( name, value ) {
                        var lname = name.toLowerCase();
                        if ( !state ) {
                            name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
                            requestHeaders[ name ] = value;
                        }
                        return this;
                    },

                    // Overrides response content-type header
                    overrideMimeType: function( type ) {
                        if ( !state ) {
                            s.mimeType = type;
                        }
                        return this;
                    },

                    // Status-dependent callbacks
                    statusCode: function( map ) {
                        var code;
                        if ( map ) {
                            if ( state < 2 ) {
                                for ( code in map ) {
                                    // Lazy-add the new callback in a way that preserves old ones
                                    statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
                                }
                            } else {
                                // Execute the appropriate callbacks
                                jqXHR.always( map[ jqXHR.status ] );
                            }
                        }
                        return this;
                    },

                    // Cancel the request
                    abort: function( statusText ) {
                        var finalText = statusText || strAbort;
                        if ( transport ) {
                            transport.abort( finalText );
                        }
                        done( 0, finalText );
                        return this;
                    }
                };

            // Attach deferreds
            deferred.promise( jqXHR ).complete = completeDeferred.add;
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;

            // Remove hash character (#7531: and string promotion)
            // Add protocol if not provided (prefilters might expect it)
            // Handle falsy url in the settings object (#10093: consistency with old signature)
            // We also use the url parameter if available
            s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
                .replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

            // Alias method option to type as per ticket #12004
            s.type = options.method || options.type || s.method || s.type;

            // Extract dataTypes list
            s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

            // A cross-domain request is in order when we have a protocol:host:port mismatch
            if ( s.crossDomain == null ) {
                parts = rurl.exec( s.url.toLowerCase() );
                s.crossDomain = !!( parts &&
                    ( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
                        ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
                        ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
                );
            }

            // Convert data if not already a string
            if ( s.data && s.processData && typeof s.data !== "string" ) {
                s.data = jQuery.param( s.data, s.traditional );
            }

            // Apply prefilters
            inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

            // If request was aborted inside a prefilter, stop there
            if ( state === 2 ) {
                return jqXHR;
            }

            // We can fire global events as of now if asked to
            fireGlobals = s.global;

            // Watch for a new set of requests
            if ( fireGlobals && jQuery.active++ === 0 ) {
                jQuery.event.trigger("ajaxStart");
            }

            // Uppercase the type
            s.type = s.type.toUpperCase();

            // Determine if request has content
            s.hasContent = !rnoContent.test( s.type );

            // Save the URL in case we're toying with the If-Modified-Since
            // and/or If-None-Match header later on
            cacheURL = s.url;

            // More options handling for requests with no content
            if ( !s.hasContent ) {

                // If data is available, append data to url
                if ( s.data ) {
                    cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
                    // #9682: remove data so that it's not used in an eventual retry
                    delete s.data;
                }

                // Add anti-cache in url if needed
                if ( s.cache === false ) {
                    s.url = rts.test( cacheURL ) ?

                        // If there is already a '_' parameter, set its value
                        cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

                        // Otherwise add one to the end
                        cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
                }
            }

            // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
            if ( s.ifModified ) {
                if ( jQuery.lastModified[ cacheURL ] ) {
                    jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
                }
                if ( jQuery.etag[ cacheURL ] ) {
                    jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
                }
            }

            // Set the correct header, if data is being sent
            if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
                jqXHR.setRequestHeader( "Content-Type", s.contentType );
            }

            // Set the Accepts header for the server, depending on the dataType
            jqXHR.setRequestHeader(
                "Accept",
                s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
                    s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
                    s.accepts[ "*" ]
            );

            // Check for headers option
            for ( i in s.headers ) {
                jqXHR.setRequestHeader( i, s.headers[ i ] );
            }

            // Allow custom headers/mimetypes and early abort
            if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
                // Abort if not done already and return
                return jqXHR.abort();
            }

            // aborting is no longer a cancellation
            strAbort = "abort";

            // Install callbacks on deferreds
            for ( i in { success: 1, error: 1, complete: 1 } ) {
                jqXHR[ i ]( s[ i ] );
            }

            // Get transport
            transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

            // If no transport, we auto-abort
            if ( !transport ) {
                done( -1, "No Transport" );
            } else {
                jqXHR.readyState = 1;

                // Send global event
                if ( fireGlobals ) {
                    globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
                }
                // Timeout
                if ( s.async && s.timeout > 0 ) {
                    timeoutTimer = setTimeout(function() {
                        jqXHR.abort("timeout");
                    }, s.timeout );
                }

                try {
                    state = 1;
                    transport.send( requestHeaders, done );
                } catch ( e ) {
                    // Propagate exception as error if not done
                    if ( state < 2 ) {
                        done( -1, e );
                        // Simply rethrow otherwise
                    } else {
                        throw e;
                    }
                }
            }

            // Callback for when everything is done
            function done( status, nativeStatusText, responses, headers ) {
                var isSuccess, success, error, response, modified,
                    statusText = nativeStatusText;

                // Called once
                if ( state === 2 ) {
                    return;
                }

                // State is "done" now
                state = 2;

                // Clear timeout if it exists
                if ( timeoutTimer ) {
                    clearTimeout( timeoutTimer );
                }

                // Dereference transport for early garbage collection
                // (no matter how long the jqXHR object will be used)
                transport = undefined;

                // Cache response headers
                responseHeadersString = headers || "";

                // Set readyState
                jqXHR.readyState = status > 0 ? 4 : 0;

                // Determine if successful
                isSuccess = status >= 200 && status < 300 || status === 304;

                // Get response data
                if ( responses ) {
                    response = ajaxHandleResponses( s, jqXHR, responses );
                }

                // Convert no matter what (that way responseXXX fields are always set)
                response = ajaxConvert( s, response, jqXHR, isSuccess );

                // If successful, handle type chaining
                if ( isSuccess ) {

                    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                    if ( s.ifModified ) {
                        modified = jqXHR.getResponseHeader("Last-Modified");
                        if ( modified ) {
                            jQuery.lastModified[ cacheURL ] = modified;
                        }
                        modified = jqXHR.getResponseHeader("etag");
                        if ( modified ) {
                            jQuery.etag[ cacheURL ] = modified;
                        }
                    }

                    // if no content
                    if ( status === 204 || s.type === "HEAD" ) {
                        statusText = "nocontent";

                        // if not modified
                    } else if ( status === 304 ) {
                        statusText = "notmodified";

                        // If we have data, let's convert it
                    } else {
                        statusText = response.state;
                        success = response.data;
                        error = response.error;
                        isSuccess = !error;
                    }
                } else {
                    // We extract error from statusText
                    // then normalize statusText and status for non-aborts
                    error = statusText;
                    if ( status || !statusText ) {
                        statusText = "error";
                        if ( status < 0 ) {
                            status = 0;
                        }
                    }
                }

                // Set data for the fake xhr object
                jqXHR.status = status;
                jqXHR.statusText = ( nativeStatusText || statusText ) + "";

                // Success/Error
                if ( isSuccess ) {
                    deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
                } else {
                    deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
                }

                // Status-dependent callbacks
                jqXHR.statusCode( statusCode );
                statusCode = undefined;

                if ( fireGlobals ) {
                    globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
                        [ jqXHR, s, isSuccess ? success : error ] );
                }

                // Complete
                completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

                if ( fireGlobals ) {
                    globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
                    // Handle the global AJAX counter
                    if ( !( --jQuery.active ) ) {
                        jQuery.event.trigger("ajaxStop");
                    }
                }
            }

            return jqXHR;
        },

        getJSON: function( url, data, callback ) {
            return jQuery.get( url, data, callback, "json" );
        },

        getScript: function( url, callback ) {
            return jQuery.get( url, undefined, callback, "script" );
        }
    });

    jQuery.each( [ "get", "post" ], function( i, method ) {
        jQuery[ method ] = function( url, data, callback, type ) {
            // shift arguments if data argument was omitted
            if ( jQuery.isFunction( data ) ) {
                type = type || callback;
                callback = data;
                data = undefined;
            }

            return jQuery.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });

    /* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
    function ajaxHandleResponses( s, jqXHR, responses ) {

        var ct, type, finalDataType, firstDataType,
            contents = s.contents,
            dataTypes = s.dataTypes;

        // Remove auto dataType and get content-type in the process
        while( dataTypes[ 0 ] === "*" ) {
            dataTypes.shift();
            if ( ct === undefined ) {
                ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
            }
        }

        // Check if we're dealing with a known content-type
        if ( ct ) {
            for ( type in contents ) {
                if ( contents[ type ] && contents[ type ].test( ct ) ) {
                    dataTypes.unshift( type );
                    break;
                }
            }
        }

        // Check to see if we have a response for the expected dataType
        if ( dataTypes[ 0 ] in responses ) {
            finalDataType = dataTypes[ 0 ];
        } else {
            // Try convertible dataTypes
            for ( type in responses ) {
                if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
                    finalDataType = type;
                    break;
                }
                if ( !firstDataType ) {
                    firstDataType = type;
                }
            }
            // Or just use first one
            finalDataType = finalDataType || firstDataType;
        }

        // If we found a dataType
        // We add the dataType to the list if needed
        // and return the corresponding response
        if ( finalDataType ) {
            if ( finalDataType !== dataTypes[ 0 ] ) {
                dataTypes.unshift( finalDataType );
            }
            return responses[ finalDataType ];
        }
    }

    /* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
    function ajaxConvert( s, response, jqXHR, isSuccess ) {
        var conv2, current, conv, tmp, prev,
            converters = {},
            // Work with a copy of dataTypes in case we need to modify it for conversion
            dataTypes = s.dataTypes.slice();

        // Create converters map with lowercased keys
        if ( dataTypes[ 1 ] ) {
            for ( conv in s.converters ) {
                converters[ conv.toLowerCase() ] = s.converters[ conv ];
            }
        }

        current = dataTypes.shift();

        // Convert to each sequential dataType
        while ( current ) {

            if ( s.responseFields[ current ] ) {
                jqXHR[ s.responseFields[ current ] ] = response;
            }

            // Apply the dataFilter if provided
            if ( !prev && isSuccess && s.dataFilter ) {
                response = s.dataFilter( response, s.dataType );
            }

            prev = current;
            current = dataTypes.shift();

            if ( current ) {

                // There's only work to do if current dataType is non-auto
                if ( current === "*" ) {

                    current = prev;

                    // Convert response if prev dataType is non-auto and differs from current
                } else if ( prev !== "*" && prev !== current ) {

                    // Seek a direct converter
                    conv = converters[ prev + " " + current ] || converters[ "* " + current ];

                    // If none found, seek a pair
                    if ( !conv ) {
                        for ( conv2 in converters ) {

                            // If conv2 outputs current
                            tmp = conv2.split( " " );
                            if ( tmp[ 1 ] === current ) {

                                // If prev can be converted to accepted input
                                conv = converters[ prev + " " + tmp[ 0 ] ] ||
                                    converters[ "* " + tmp[ 0 ] ];
                                if ( conv ) {
                                    // Condense equivalence converters
                                    if ( conv === true ) {
                                        conv = converters[ conv2 ];

                                        // Otherwise, insert the intermediate dataType
                                    } else if ( converters[ conv2 ] !== true ) {
                                        current = tmp[ 0 ];
                                        dataTypes.unshift( tmp[ 1 ] );
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    // Apply converter (if not an equivalence)
                    if ( conv !== true ) {

                        // Unless errors are allowed to bubble, catch and return them
                        if ( conv && s[ "throws" ] ) {
                            response = conv( response );
                        } else {
                            try {
                                response = conv( response );
                            } catch ( e ) {
                                return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
                            }
                        }
                    }
                }
            }
        }

        return { state: "success", data: response };
    }
// Install script dataType
    jQuery.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /(?:java|ecma)script/
        },
        converters: {
            "text script": function( text ) {
                jQuery.globalEval( text );
                return text;
            }
        }
    });

// Handle cache's special case and crossDomain
    jQuery.ajaxPrefilter( "script", function( s ) {
        if ( s.cache === undefined ) {
            s.cache = false;
        }
        if ( s.crossDomain ) {
            s.type = "GET";
        }
    });

// Bind script tag hack transport
    jQuery.ajaxTransport( "script", function( s ) {
        // This transport only deals with cross domain requests
        if ( s.crossDomain ) {
            var script, callback;
            return {
                send: function( _, complete ) {
                    script = jQuery("<script>").prop({
                        async: true,
                        charset: s.scriptCharset,
                        src: s.url
                    }).on(
                        "load error",
                        callback = function( evt ) {
                            script.remove();
                            callback = null;
                            if ( evt ) {
                                complete( evt.type === "error" ? 404 : 200, evt.type );
                            }
                        }
                    );
                    document.head.appendChild( script[ 0 ] );
                },
                abort: function() {
                    if ( callback ) {
                        callback();
                    }
                }
            };
        }
    });
    var oldCallbacks = [],
        rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
    jQuery.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
            this[ callback ] = true;
            return callback;
        }
    });

// Detect, normalize options and install callbacks for jsonp requests
    jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

        var callbackName, overwritten, responseContainer,
            jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
                    "url" :
                    typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
            );

        // Handle iff the expected data type is "jsonp" or we have a parameter to set
        if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

            // Get callback name, remembering preexisting value associated with it
            callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
                s.jsonpCallback() :
                s.jsonpCallback;

            // Insert callback into url or form data
            if ( jsonProp ) {
                s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
            } else if ( s.jsonp !== false ) {
                s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
            }

            // Use data converter to retrieve json after script execution
            s.converters["script json"] = function() {
                if ( !responseContainer ) {
                    jQuery.error( callbackName + " was not called" );
                }
                return responseContainer[ 0 ];
            };

            // force json dataType
            s.dataTypes[ 0 ] = "json";

            // Install callback
            overwritten = window[ callbackName ];
            window[ callbackName ] = function() {
                responseContainer = arguments;
            };

            // Clean-up function (fires after converters)
            jqXHR.always(function() {
                // Restore preexisting value
                window[ callbackName ] = overwritten;

                // Save back as free
                if ( s[ callbackName ] ) {
                    // make sure that re-using the options doesn't screw things around
                    s.jsonpCallback = originalSettings.jsonpCallback;

                    // save the callback name for future use
                    oldCallbacks.push( callbackName );
                }

                // Call if it was a function and we have a response
                if ( responseContainer && jQuery.isFunction( overwritten ) ) {
                    overwritten( responseContainer[ 0 ] );
                }

                responseContainer = overwritten = undefined;
            });

            // Delegate to script
            return "script";
        }
    });
    jQuery.ajaxSettings.xhr = function() {
        try {
            return new XMLHttpRequest();
        } catch( e ) {}
    };

    var xhrSupported = jQuery.ajaxSettings.xhr(),
        xhrSuccessStatus = {
            // file protocol always yields status code 0, assume 200
            0: 200,
            // Support: IE9
            // #1450: sometimes IE returns 1223 when it should be 204
            1223: 204
        },
        // Support: IE9
        // We need to keep track of outbound xhr and abort them manually
        // because IE is not smart enough to do it all by itself
        xhrId = 0,
        xhrCallbacks = {};

    if ( window.ActiveXObject ) {
        jQuery( window ).on( "unload", function() {
            for( var key in xhrCallbacks ) {
                xhrCallbacks[ key ]();
            }
            xhrCallbacks = undefined;
        });
    }

    // 跨域携带cookie
    jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
    // 支持ajax
    jQuery.support.ajax = xhrSupported = !!xhrSupported;

    jQuery.ajaxTransport(function( options ) {
        var callback;
        // Cross domain only allowed if supported through XMLHttpRequest
        if ( jQuery.support.cors || xhrSupported && !options.crossDomain ) {
            return {
                send: function( headers, complete ) {
                    var i, id,
                        xhr = options.xhr();
                    xhr.open( options.type, options.url, options.async, options.username, options.password );
                    // Apply custom fields if provided
                    if ( options.xhrFields ) {
                        for ( i in options.xhrFields ) {
                            xhr[ i ] = options.xhrFields[ i ];
                        }
                    }
                    // Override mime type if needed
                    if ( options.mimeType && xhr.overrideMimeType ) {
                        xhr.overrideMimeType( options.mimeType );
                    }
                    // X-Requested-With header
                    // For cross-domain requests, seeing as conditions for a preflight are
                    // akin to a jigsaw puzzle, we simply never set it to be sure.
                    // (it can always be set on a per-request basis or even using ajaxSetup)
                    // For same-domain requests, won't change header if already provided.
                    if ( !options.crossDomain && !headers["X-Requested-With"] ) {
                        headers["X-Requested-With"] = "XMLHttpRequest";
                    }
                    // Set headers
                    for ( i in headers ) {
                        xhr.setRequestHeader( i, headers[ i ] );
                    }
                    // Callback
                    callback = function( type ) {
                        return function() {
                            if ( callback ) {
                                delete xhrCallbacks[ id ];
                                callback = xhr.onload = xhr.onerror = null;
                                if ( type === "abort" ) {
                                    xhr.abort();
                                } else if ( type === "error" ) {
                                    complete(
                                        // file protocol always yields status 0, assume 404
                                        xhr.status || 404,
                                        xhr.statusText
                                    );
                                } else {
                                    complete(
                                        xhrSuccessStatus[ xhr.status ] || xhr.status,
                                        xhr.statusText,
                                        // Support: IE9
                                        // #11426: When requesting binary data, IE9 will throw an exception
                                        // on any attempt to access responseText
                                        typeof xhr.responseText === "string" ? {
                                            text: xhr.responseText
                                        } : undefined,
                                        xhr.getAllResponseHeaders()
                                    );
                                }
                            }
                        };
                    };
                    // Listen to events
                    xhr.onload = callback();
                    xhr.onerror = callback("error");
                    // Create the abort callback
                    callback = xhrCallbacks[( id = xhrId++ )] = callback("abort");
                    // Do send the request
                    // This may raise an exception which is actually
                    // handled in jQuery.ajax (so no try/catch here)
                    xhr.send( options.hasContent && options.data || null );
                },
                abort: function() {
                    if ( callback ) {
                        callback();
                    }
                }
            };
        }
    });
    // todo 动画 animate
    var fxNow, timerId,
        rfxtypes = /^(?:toggle|show|hide)$/,
        rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
        rrun = /queueHooks$/,
        animationPrefilters = [ defaultPrefilter ],
        tweeners = {
            "*": [function( prop, value ) {
                var tween = this.createTween( prop, value ),
                    target = tween.cur(),
                    parts = rfxnum.exec( value ),
                    unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

                    // Starting value computation is required for potential unit mismatches
                    start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
                        rfxnum.exec( jQuery.css( tween.elem, prop ) ),
                    scale = 1,
                    maxIterations = 20;

                if ( start && start[ 3 ] !== unit ) {
                    // Trust units reported by jQuery.css
                    unit = unit || start[ 3 ];

                    // Make sure we update the tween properties later on
                    parts = parts || [];

                    // Iteratively approximate from a nonzero starting point
                    start = +target || 1;

                    do {
                        // If previous iteration zeroed out, double until we get *something*
                        // Use a string for doubling factor so we don't accidentally see scale as unchanged below
                        scale = scale || ".5";

                        // Adjust and apply
                        start = start / scale;
                        jQuery.style( tween.elem, prop, start + unit );

                        // Update scale, tolerating zero or NaN from tween.cur()
                        // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
                    } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
                }

                // Update tween properties
                if ( parts ) {
                    start = tween.start = +start || +target || 0;
                    tween.unit = unit;
                    // If a +=/-= token was provided, we're doing a relative animation
                    tween.end = parts[ 1 ] ?
                        start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
                        +parts[ 2 ];
                }

                return tween;
            }]
        };

// Animations created synchronously will run synchronously
    function createFxNow() {
        setTimeout(function() {
            fxNow = undefined;
        });
        return ( fxNow = jQuery.now() );
    }

    function createTween( value, prop, animation ) {
        var tween,
            collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
            index = 0,
            length = collection.length;
        for ( ; index < length; index++ ) {
            if ( (tween = collection[ index ].call( animation, prop, value )) ) {

                // we're done with this property
                return tween;
            }
        }
    }

    function Animation( elem, properties, options ) {
        var result,
            stopped,
            index = 0,
            length = animationPrefilters.length,
            deferred = jQuery.Deferred().always( function() {
                // don't match elem in the :animated selector
                delete tick.elem;
            }),
            tick = function() {
                if ( stopped ) {
                    return false;
                }
                var currentTime = fxNow || createFxNow(),
                    remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
                    // archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
                    temp = remaining / animation.duration || 0,
                    percent = 1 - temp,
                    index = 0,
                    length = animation.tweens.length;

                for ( ; index < length ; index++ ) {
                    animation.tweens[ index ].run( percent );
                }

                deferred.notifyWith( elem, [ animation, percent, remaining ]);

                if ( percent < 1 && length ) {
                    return remaining;
                } else {
                    deferred.resolveWith( elem, [ animation ] );
                    return false;
                }
            },
            animation = deferred.promise({
                elem: elem,
                props: jQuery.extend( {}, properties ),
                opts: jQuery.extend( true, { specialEasing: {} }, options ),
                originalProperties: properties,
                originalOptions: options,
                startTime: fxNow || createFxNow(),
                duration: options.duration,
                tweens: [],
                createTween: function( prop, end ) {
                    var tween = jQuery.Tween( elem, animation.opts, prop, end,
                        animation.opts.specialEasing[ prop ] || animation.opts.easing );
                    animation.tweens.push( tween );
                    return tween;
                },
                stop: function( gotoEnd ) {
                    var index = 0,
                        // if we are going to the end, we want to run all the tweens
                        // otherwise we skip this part
                        length = gotoEnd ? animation.tweens.length : 0;
                    if ( stopped ) {
                        return this;
                    }
                    stopped = true;
                    for ( ; index < length ; index++ ) {
                        animation.tweens[ index ].run( 1 );
                    }

                    // resolve when we played the last frame
                    // otherwise, reject
                    if ( gotoEnd ) {
                        deferred.resolveWith( elem, [ animation, gotoEnd ] );
                    } else {
                        deferred.rejectWith( elem, [ animation, gotoEnd ] );
                    }
                    return this;
                }
            }),
            props = animation.props;

        propFilter( props, animation.opts.specialEasing );

        for ( ; index < length ; index++ ) {
            result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
            if ( result ) {
                return result;
            }
        }

        jQuery.map( props, createTween, animation );

        if ( jQuery.isFunction( animation.opts.start ) ) {
            animation.opts.start.call( elem, animation );
        }

        jQuery.fx.timer(
            jQuery.extend( tick, {
                elem: elem,
                anim: animation,
                queue: animation.opts.queue
            })
        );

        // attach callbacks from options
        return animation.progress( animation.opts.progress )
            .done( animation.opts.done, animation.opts.complete )
            .fail( animation.opts.fail )
            .always( animation.opts.always );
    }

    function propFilter( props, specialEasing ) {
        var index, name, easing, value, hooks;

        // camelCase, specialEasing and expand cssHook pass
        for ( index in props ) {
            name = jQuery.camelCase( index );
            easing = specialEasing[ name ];
            value = props[ index ];
            if ( jQuery.isArray( value ) ) {
                easing = value[ 1 ];
                value = props[ index ] = value[ 0 ];
            }

            if ( index !== name ) {
                props[ name ] = value;
                delete props[ index ];
            }

            hooks = jQuery.cssHooks[ name ];
            if ( hooks && "expand" in hooks ) {
                value = hooks.expand( value );
                delete props[ name ];

                // not quite $.extend, this wont overwrite keys already present.
                // also - reusing 'index' from above because we have the correct "name"
                for ( index in value ) {
                    if ( !( index in props ) ) {
                        props[ index ] = value[ index ];
                        specialEasing[ index ] = easing;
                    }
                }
            } else {
                specialEasing[ name ] = easing;
            }
        }
    }

    jQuery.Animation = jQuery.extend( Animation, {

        tweener: function( props, callback ) {
            if ( jQuery.isFunction( props ) ) {
                callback = props;
                props = [ "*" ];
            } else {
                props = props.split(" ");
            }

            var prop,
                index = 0,
                length = props.length;

            for ( ; index < length ; index++ ) {
                prop = props[ index ];
                tweeners[ prop ] = tweeners[ prop ] || [];
                tweeners[ prop ].unshift( callback );
            }
        },

        prefilter: function( callback, prepend ) {
            if ( prepend ) {
                animationPrefilters.unshift( callback );
            } else {
                animationPrefilters.push( callback );
            }
        }
    });

    function defaultPrefilter( elem, props, opts ) {
        /* jshint validthis: true */
        var prop, value, toggle, tween, hooks, oldfire,
            anim = this,
            orig = {},
            style = elem.style,
            hidden = elem.nodeType && isHidden( elem ),
            dataShow = data_priv.get( elem, "fxshow" );

        // handle queue: false promises
        if ( !opts.queue ) {
            hooks = jQuery._queueHooks( elem, "fx" );
            if ( hooks.unqueued == null ) {
                hooks.unqueued = 0;
                oldfire = hooks.empty.fire;
                hooks.empty.fire = function() {
                    if ( !hooks.unqueued ) {
                        oldfire();
                    }
                };
            }
            hooks.unqueued++;

            anim.always(function() {
                // doing this makes sure that the complete handler will be called
                // before this completes
                anim.always(function() {
                    hooks.unqueued--;
                    if ( !jQuery.queue( elem, "fx" ).length ) {
                        hooks.empty.fire();
                    }
                });
            });
        }

        // height/width overflow pass
        if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
            // Make sure that nothing sneaks out
            // Record all 3 overflow attributes because IE9-10 do not
            // change the overflow attribute when overflowX and
            // overflowY are set to the same value
            opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

            // Set display property to inline-block for height/width
            // animations on inline elements that are having width/height animated
            if ( jQuery.css( elem, "display" ) === "inline" &&
                jQuery.css( elem, "float" ) === "none" ) {

                style.display = "inline-block";
            }
        }

        if ( opts.overflow ) {
            style.overflow = "hidden";
            anim.always(function() {
                style.overflow = opts.overflow[ 0 ];
                style.overflowX = opts.overflow[ 1 ];
                style.overflowY = opts.overflow[ 2 ];
            });
        }


        // show/hide pass
        for ( prop in props ) {
            value = props[ prop ];
            if ( rfxtypes.exec( value ) ) {
                delete props[ prop ];
                toggle = toggle || value === "toggle";
                if ( value === ( hidden ? "hide" : "show" ) ) {

                    // If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
                    if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
                        hidden = true;
                    } else {
                        continue;
                    }
                }
                orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
            }
        }

        if ( !jQuery.isEmptyObject( orig ) ) {
            if ( dataShow ) {
                if ( "hidden" in dataShow ) {
                    hidden = dataShow.hidden;
                }
            } else {
                dataShow = data_priv.access( elem, "fxshow", {} );
            }

            // store state if its toggle - enables .stop().toggle() to "reverse"
            if ( toggle ) {
                dataShow.hidden = !hidden;
            }
            if ( hidden ) {
                jQuery( elem ).show();
            } else {
                anim.done(function() {
                    jQuery( elem ).hide();
                });
            }
            anim.done(function() {
                var prop;

                data_priv.remove( elem, "fxshow" );
                for ( prop in orig ) {
                    jQuery.style( elem, prop, orig[ prop ] );
                }
            });
            for ( prop in orig ) {
                tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

                if ( !( prop in dataShow ) ) {
                    dataShow[ prop ] = tween.start;
                    if ( hidden ) {
                        tween.end = tween.start;
                        tween.start = prop === "width" || prop === "height" ? 1 : 0;
                    }
                }
            }
        }
    }

    function Tween( elem, options, prop, end, easing ) {
        return new Tween.prototype.init( elem, options, prop, end, easing );
    }
    jQuery.Tween = Tween;

    Tween.prototype = {
        constructor: Tween,
        init: function( elem, options, prop, end, easing, unit ) {
            this.elem = elem;
            this.prop = prop;
            this.easing = easing || "swing";
            this.options = options;
            this.start = this.now = this.cur();
            this.end = end;
            this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
        },
        cur: function() {
            var hooks = Tween.propHooks[ this.prop ];

            return hooks && hooks.get ?
                hooks.get( this ) :
                Tween.propHooks._default.get( this );
        },
        run: function( percent ) {
            var eased,
                hooks = Tween.propHooks[ this.prop ];

            if ( this.options.duration ) {
                this.pos = eased = jQuery.easing[ this.easing ](
                    percent, this.options.duration * percent, 0, 1, this.options.duration
                );
            } else {
                this.pos = eased = percent;
            }
            this.now = ( this.end - this.start ) * eased + this.start;

            if ( this.options.step ) {
                this.options.step.call( this.elem, this.now, this );
            }

            if ( hooks && hooks.set ) {
                hooks.set( this );
            } else {
                Tween.propHooks._default.set( this );
            }
            return this;
        }
    };

    Tween.prototype.init.prototype = Tween.prototype;

    Tween.propHooks = {
        _default: {
            get: function( tween ) {
                var result;

                if ( tween.elem[ tween.prop ] != null &&
                    (!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
                    return tween.elem[ tween.prop ];
                }

                // passing an empty string as a 3rd parameter to .css will automatically
                // attempt a parseFloat and fallback to a string if the parse fails
                // so, simple values such as "10px" are parsed to Float.
                // complex values such as "rotate(1rad)" are returned as is.
                result = jQuery.css( tween.elem, tween.prop, "" );
                // Empty strings, null, undefined and "auto" are converted to 0.
                return !result || result === "auto" ? 0 : result;
            },
            set: function( tween ) {
                // use step hook for back compat - use cssHook if its there - use .style if its
                // available and use plain properties where available
                if ( jQuery.fx.step[ tween.prop ] ) {
                    jQuery.fx.step[ tween.prop ]( tween );
                } else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
                    jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
                } else {
                    tween.elem[ tween.prop ] = tween.now;
                }
            }
        }
    };

// Support: IE9
// Panic based approach to setting things on disconnected nodes

    Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
        set: function( tween ) {
            if ( tween.elem.nodeType && tween.elem.parentNode ) {
                tween.elem[ tween.prop ] = tween.now;
            }
        }
    };

    jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
        var cssFn = jQuery.fn[ name ];
        jQuery.fn[ name ] = function( speed, easing, callback ) {
            return speed == null || typeof speed === "boolean" ?
                cssFn.apply( this, arguments ) :
                this.animate( genFx( name, true ), speed, easing, callback );
        };
    });

    jQuery.fn.extend({
        fadeTo: function( speed, to, easing, callback ) {

            // show any hidden elements after setting opacity to 0
            return this.filter( isHidden ).css( "opacity", 0 ).show()

            // animate to the value specified
                .end().animate({ opacity: to }, speed, easing, callback );
        },
        animate: function( prop, speed, easing, callback ) {
            var empty = jQuery.isEmptyObject( prop ),
                optall = jQuery.speed( speed, easing, callback ),
                doAnimation = function() {
                    // Operate on a copy of prop so per-property easing won't be lost
                    var anim = Animation( this, jQuery.extend( {}, prop ), optall );

                    // Empty animations, or finishing resolves immediately
                    if ( empty || data_priv.get( this, "finish" ) ) {
                        anim.stop( true );
                    }
                };
            doAnimation.finish = doAnimation;

            return empty || optall.queue === false ?
                this.each( doAnimation ) :
                this.queue( optall.queue, doAnimation );
        },
        stop: function( type, clearQueue, gotoEnd ) {
            var stopQueue = function( hooks ) {
                var stop = hooks.stop;
                delete hooks.stop;
                stop( gotoEnd );
            };

            if ( typeof type !== "string" ) {
                gotoEnd = clearQueue;
                clearQueue = type;
                type = undefined;
            }
            if ( clearQueue && type !== false ) {
                this.queue( type || "fx", [] );
            }

            return this.each(function() {
                var dequeue = true,
                    index = type != null && type + "queueHooks",
                    timers = jQuery.timers,
                    data = data_priv.get( this );

                if ( index ) {
                    if ( data[ index ] && data[ index ].stop ) {
                        stopQueue( data[ index ] );
                    }
                } else {
                    for ( index in data ) {
                        if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
                            stopQueue( data[ index ] );
                        }
                    }
                }

                for ( index = timers.length; index--; ) {
                    if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
                        timers[ index ].anim.stop( gotoEnd );
                        dequeue = false;
                        timers.splice( index, 1 );
                    }
                }

                // start the next in the queue if the last step wasn't forced
                // timers currently will call their complete callbacks, which will dequeue
                // but only if they were gotoEnd
                if ( dequeue || !gotoEnd ) {
                    jQuery.dequeue( this, type );
                }
            });
        },
        finish: function( type ) {
            if ( type !== false ) {
                type = type || "fx";
            }
            return this.each(function() {
                var index,
                    data = data_priv.get( this ),
                    queue = data[ type + "queue" ],
                    hooks = data[ type + "queueHooks" ],
                    timers = jQuery.timers,
                    length = queue ? queue.length : 0;

                // enable finishing flag on private data
                data.finish = true;

                // empty the queue first
                jQuery.queue( this, type, [] );

                if ( hooks && hooks.stop ) {
                    hooks.stop.call( this, true );
                }

                // look for any active animations, and finish them
                for ( index = timers.length; index--; ) {
                    if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
                        timers[ index ].anim.stop( true );
                        timers.splice( index, 1 );
                    }
                }

                // look for any animations in the old queue and finish them
                for ( index = 0; index < length; index++ ) {
                    if ( queue[ index ] && queue[ index ].finish ) {
                        queue[ index ].finish.call( this );
                    }
                }

                // turn off finishing flag
                delete data.finish;
            });
        }
    });

// Generate parameters to create a standard animation
    function genFx( type, includeWidth ) {
        var which,
            attrs = { height: type },
            i = 0;

        // if we include width, step value is 1 to do all cssExpand values,
        // if we don't include width, step value is 2 to skip over Left and Right
        includeWidth = includeWidth? 1 : 0;
        for( ; i < 4 ; i += 2 - includeWidth ) {
            which = cssExpand[ i ];
            attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
        }

        if ( includeWidth ) {
            attrs.opacity = attrs.width = type;
        }

        return attrs;
    }

// Generate shortcuts for custom animations
    jQuery.each({
        slideDown: genFx("show"),
        slideUp: genFx("hide"),
        slideToggle: genFx("toggle"),
        fadeIn: { opacity: "show" },
        fadeOut: { opacity: "hide" },
        fadeToggle: { opacity: "toggle" }
    }, function( name, props ) {
        jQuery.fn[ name ] = function( speed, easing, callback ) {
            return this.animate( props, speed, easing, callback );
        };
    });

    jQuery.speed = function( speed, easing, fn ) {
        var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
            complete: fn || !fn && easing ||
                jQuery.isFunction( speed ) && speed,
            duration: speed,
            easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
        };

        opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
            opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

        // normalize opt.queue - true/undefined/null -> "fx"
        if ( opt.queue == null || opt.queue === true ) {
            opt.queue = "fx";
        }

        // Queueing
        opt.old = opt.complete;

        opt.complete = function() {
            if ( jQuery.isFunction( opt.old ) ) {
                opt.old.call( this );
            }

            if ( opt.queue ) {
                jQuery.dequeue( this, opt.queue );
            }
        };

        return opt;
    };

    jQuery.easing = {
        linear: function( p ) {
            return p;
        },
        swing: function( p ) {
            return 0.5 - Math.cos( p*Math.PI ) / 2;
        }
    };

    jQuery.timers = [];
    jQuery.fx = Tween.prototype.init;
    jQuery.fx.tick = function() {
        var timer,
            timers = jQuery.timers,
            i = 0;

        fxNow = jQuery.now();

        for ( ; i < timers.length; i++ ) {
            timer = timers[ i ];
            // Checks the timer has not already been removed
            if ( !timer() && timers[ i ] === timer ) {
                timers.splice( i--, 1 );
            }
        }

        if ( !timers.length ) {
            jQuery.fx.stop();
        }
        fxNow = undefined;
    };

    jQuery.fx.timer = function( timer ) {
        if ( timer() && jQuery.timers.push( timer ) ) {
            jQuery.fx.start();
        }
    };

    jQuery.fx.interval = 13;

    jQuery.fx.start = function() {
        if ( !timerId ) {
            timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
        }
    };

    jQuery.fx.stop = function() {
        clearInterval( timerId );
        timerId = null;
    };

    jQuery.fx.speeds = {
        slow: 600,
        fast: 200,
        // Default speed
        _default: 400
    };

// Back Compat <1.8 extension point
    jQuery.fx.step = {};

    if ( jQuery.expr && jQuery.expr.filters ) {
        jQuery.expr.filters.animated = function( elem ) {
            return jQuery.grep(jQuery.timers, function( fn ) {
                return elem === fn.elem;
            }).length;
        };
    }
    // todo 获取位置尺寸
    jQuery.fn.offset = function( options ) {
        if ( arguments.length ) {
            return options === undefined ?
                this :
                this.each(function( i ) {
                    jQuery.offset.setOffset( this, options, i );
                });
        }

        var docElem, win,
            elem = this[ 0 ],
            box = { top: 0, left: 0 },
            doc = elem && elem.ownerDocument;

        if ( !doc ) {
            return;
        }

        docElem = doc.documentElement;

        // Make sure it's not a disconnected DOM node
        if ( !jQuery.contains( docElem, elem ) ) {
            return box;
        }

        // If we don't have gBCR, just use 0,0 rather than error
        // BlackBerry 5, iOS 3 (original iPhone)
        if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow( doc );
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    };

    jQuery.offset = {

        setOffset: function( elem, options, i ) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                position = jQuery.css( elem, "position" ),
                curElem = jQuery( elem ),
                props = {};

            // Set position first, in-case top/left are set even on static elem
            if ( position === "static" ) {
                elem.style.position = "relative";
            }

            curOffset = curElem.offset();
            curCSSTop = jQuery.css( elem, "top" );
            curCSSLeft = jQuery.css( elem, "left" );
            calculatePosition = ( position === "absolute" || position === "fixed" ) && ( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

            // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
            if ( calculatePosition ) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;

            } else {
                curTop = parseFloat( curCSSTop ) || 0;
                curLeft = parseFloat( curCSSLeft ) || 0;
            }

            if ( jQuery.isFunction( options ) ) {
                options = options.call( elem, i, curOffset );
            }

            if ( options.top != null ) {
                props.top = ( options.top - curOffset.top ) + curTop;
            }
            if ( options.left != null ) {
                props.left = ( options.left - curOffset.left ) + curLeft;
            }

            if ( "using" in options ) {
                options.using.call( elem, props );

            } else {
                curElem.css( props );
            }
        }
    };


    jQuery.fn.extend({

        position: function() {
            if ( !this[ 0 ] ) {
                return;
            }

            var offsetParent, offset,
                elem = this[ 0 ],
                parentOffset = { top: 0, left: 0 };

            // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
            if ( jQuery.css( elem, "position" ) === "fixed" ) {
                // We assume that getBoundingClientRect is available when computed position is fixed
                offset = elem.getBoundingClientRect();

            } else {
                // Get *real* offsetParent
                offsetParent = this.offsetParent();

                // Get correct offsets
                offset = this.offset();
                if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
                    parentOffset = offsetParent.offset();
                }

                // Add offsetParent borders
                parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
                parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
            }

            // Subtract parent offsets and element margins
            return {
                top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
                left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
            };
        },

        offsetParent: function() {
            return this.map(function() {
                var offsetParent = this.offsetParent || docElem;

                while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
                    offsetParent = offsetParent.offsetParent;
                }

                return offsetParent || docElem;
            });
        }
    });


// Create scrollLeft and scrollTop methods
    jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
        var top = "pageYOffset" === prop;

        jQuery.fn[ method ] = function( val ) {
            return jQuery.access( this, function( elem, method, val ) {
                var win = getWindow( elem );

                if ( val === undefined ) {
                    return win ? win[ prop ] : elem[ method ];
                }

                if ( win ) {
                    win.scrollTo(
                        !top ? val : window.pageXOffset,
                        top ? val : window.pageYOffset
                    );

                } else {
                    elem[ method ] = val;
                }
            }, method, val, arguments.length, null );
        };
    });

    function getWindow( elem ) {
        return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
    }
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
//     双层循环 组成键名 funcName
    jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
        jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
            // margin is only for outerHeight, outerWidth
            // 添加到原型上
            jQuery.fn[ funcName ] = function( margin, value ) {
                var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
                    // 是否要计算margin
                    extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

                return jQuery.access( this, function( elem, type, value ) {
                    var doc;

                    // 可视区域的宽高
                    // 如果当前操作对象是window
                    if ( jQuery.isWindow( elem ) ) {
                        // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
                        // isn't a whole lot we can do. See pull request at this URL for discussion:
                        // https://github.com/jquery/jquery/pull/764
                        return elem.document.documentElement[ "client" + name ];
                    }

                    // Get document width or height
                    // 如果是document的时候
                    // 整个页面的宽高
                    if ( elem.nodeType === 9 ) {
                        doc = elem.documentElement;

                        // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
                        // whichever is greatest
                        return Math.max(
                            elem.body[ "scroll" + name ], doc[ "scroll" + name ],
                            elem.body[ "offset" + name ], doc[ "offset" + name ],
                            doc[ "client" + name ]
                        );
                    }

                    return value === undefined ?
                        // 获取
                        // Get width or height on the element, requesting but not forcing parseFloat
                        jQuery.css( elem, type, extra ) :

                        // Set width or height on the element
                        // 设置
                        jQuery.style( elem, type, value, extra );
                }, type, chainable ? margin : undefined, chainable, null );
            };
        });
    });
// Limit scope pollution from any deprecated API
// (function() {

// The number of elements contained in the matched element set
    jQuery.fn.size = function() {
        return this.length;
    };

    jQuery.fn.andSelf = jQuery.fn.addBack;

// })();
    // todo 模块化
    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        // Expose jQuery as module.exports in loaders that implement the Node
        // module pattern (including browserify). Do not create the global, since
        // the user will be storing it themselves locally, and globals are frowned
        // upon in the Node module world.
        module.exports = jQuery;
    } else {
        // Register as a named AMD module, since jQuery can be concatenated with other
        // files that may use define, but not via a proper concatenation script that
        // understands anonymous AMD modules. A named AMD is safest and most robust
        // way to register. Lowercase jquery is used because AMD module names are
        // derived from file names, and jQuery is normally delivered in a lowercase
        // file name. Do this after creating the global so that if an AMD module wants
        // to call noConflict to hide this version of jQuery, it will work.
        if ( typeof define === "function" && define.amd ) {
            define( "jquery", [], function () { return jQuery; } );
        }
    }

// If there is a window object, that at least has a document property,
// define jQuery and $ identifiers
//    todo 对外暴露 挂载在window上
    if ( typeof window === "object" && typeof window.document === "object" ) {
        window.jQuery = window.$ = jQuery;
    }

})( window );