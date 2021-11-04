
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.5' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\App.svelte generated by Svelte v3.42.5 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    // (221:3) {#if ready}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_intro;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "resources/fancy-cad.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "CAD");
    			attr_dev(img, "class", "svelte-g2hxqa");
    			add_location(img, file, 221, 57, 4165);
    			attr_dev(div0, "class", "alignCAD svelte-g2hxqa");
    			add_location(div0, file, 221, 35, 4143);
    			attr_dev(div1, "class", "visible-on-mount svelte-g2hxqa");
    			add_location(div1, file, 221, 5, 4113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    		},
    		i: function intro(local) {
    			if (!img_intro) {
    				add_render_callback(() => {
    					img_intro = create_in_transition(img, fly, { x: 200, duration: 750 });
    					img_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(221:3) {#if ready}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let nav;
    	let a0;
    	let t3;
    	let a1;
    	let t5;
    	let a2;
    	let t7;
    	let a3;
    	let t9;
    	let a4;
    	let i0;
    	let t10;
    	let a5;
    	let img;
    	let img_src_value;
    	let t11;
    	let div1;
    	let span0;
    	let h10;
    	let t12;
    	let b;
    	let t14;
    	let h11;
    	let t16;
    	let p0;
    	let t18;
    	let div0;
    	let t19;
    	let div2;
    	let span1;
    	let t20;
    	let h12;
    	let t22;
    	let p1;
    	let t24;
    	let p2;
    	let t26;
    	let p3;
    	let t28;
    	let p4;
    	let t30;
    	let h13;
    	let t32;
    	let div3;
    	let a6;
    	let i1;
    	let t33;
    	let t34;
    	let a7;
    	let i2;
    	let t35;
    	let t36;
    	let a8;
    	let i3;
    	let t37;
    	let t38;
    	let a9;
    	let i4;
    	let t39;
    	let t40;
    	let div4;
    	let if_block = /*ready*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Sponsors";
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "Projects";
    			t5 = space();
    			a2 = element("a");
    			a2.textContent = "Members";
    			t7 = space();
    			a3 = element("a");
    			a3.textContent = "Home";
    			t9 = space();
    			a4 = element("a");
    			i0 = element("i");
    			t10 = space();
    			a5 = element("a");
    			img = element("img");
    			t11 = space();
    			div1 = element("div");
    			span0 = element("span");
    			h10 = element("h1");
    			t12 = text("Inf");
    			b = element("b");
    			b.textContent = "O(1)";
    			t14 = space();
    			h11 = element("h1");
    			h11.textContent = "Robotics";
    			t16 = space();
    			p0 = element("p");
    			p0.textContent = "Education Through Innovation";
    			t18 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t19 = space();
    			div2 = element("div");
    			span1 = element("span");
    			t20 = space();
    			h12 = element("h1");
    			h12.textContent = "About us";
    			t22 = space();
    			p1 = element("p");
    			p1.textContent = "We are the infO(1)Robotics Team – RO 140 - from “Ion Luca Caragiale”\n\t\t  High - School, Ploiesti, Romania. Our team started its actions on April\n\t\t  2018, and it is coordinated by our main mentor Daniela Lica, a Computer\n\t\t  – Programming teacher. Our team is composed of 15 members and 36\n\t\t  volunteers and each of them is currently working in the STEM fields with\n\t\t  extracurricular activities which fit their sub-teams. Our team started\n\t\t  with no budget and has been gradually building up its financial\n\t\t  resources.";
    			t24 = space();
    			p2 = element("p");
    			p2.textContent = "infO(1)Robotics is currently participating for the second time at FIRST\n\t\t  Tech Challenge and expects to consolidate the knowledge accumulated over\n\t\t  the course of the first year. At the Regionals competition, we were\n\t\t  awarded with the 2nd place of Inspire Award, but also with the title of\n\t\t  the 2nd pick in the Winning Alliance. We qualified as the 3rd team to\n\t\t  the National Stage at which we won the 2nd place of the Control Award.";
    			t26 = space();
    			p3 = element("p");
    			p3.textContent = "We combine work and pleasure, we always train hard but in an enjoyable\n\t\t  way. By sharing opinions and learning about team work, we believe we can\n\t\t  get creative enough to someday find a revolutionary and feasible idea of\n\t\t  a robot that could unbelievably save humanity in its own way.";
    			t28 = space();
    			p4 = element("p");
    			p4.textContent = "infO(1)Robotics is currently participating for the second time at FIRST\n\t\t  Tech Challenge and expects to consolidate the knowledge accumulated over\n\t\t  the course of the first year. At the Regionals competition, we were\n\t\t  awarded with the 2nd place of Inspire Award, but also with the title of\n\t\t  the 2nd pick in the Winning Alliance. We qualified as the 3rd team to\n\t\t  the National Stage at which we won the 2nd place of the Control Award.";
    			t30 = space();
    			h13 = element("h1");
    			h13.textContent = "Follow us on social media";
    			t32 = space();
    			div3 = element("div");
    			a6 = element("a");
    			i1 = element("i");
    			t33 = text(" Instagram");
    			t34 = space();
    			a7 = element("a");
    			i2 = element("i");
    			t35 = text(" Youtube");
    			t36 = space();
    			a8 = element("a");
    			i3 = element("i");
    			t37 = text(" Facebook");
    			t38 = space();
    			a9 = element("a");
    			i4 = element("i");
    			t39 = text(" Email");
    			t40 = space();
    			div4 = element("div");
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "resources/font/fonts.css");
    			attr_dev(link0, "class", "svelte-g2hxqa");
    			add_location(link0, file, 196, 1, 3273);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    			attr_dev(link1, "class", "svelte-g2hxqa");
    			add_location(link1, file, 197, 4, 3335);
    			attr_dev(a0, "href", "/sponsors.html");
    			attr_dev(a0, "class", "svelte-g2hxqa");
    			add_location(a0, file, 201, 2, 3495);
    			attr_dev(a1, "href", "#Projects");
    			attr_dev(a1, "class", "svelte-g2hxqa");
    			add_location(a1, file, 202, 2, 3535);
    			attr_dev(a2, "href", "/members.html");
    			attr_dev(a2, "class", "svelte-g2hxqa");
    			add_location(a2, file, 203, 2, 3570);
    			attr_dev(a3, "href", "#home");
    			attr_dev(a3, "class", "nav-active svelte-g2hxqa");
    			add_location(a3, file, 204, 2, 3608);
    			attr_dev(i0, "class", "fa fa-bars svelte-g2hxqa");
    			add_location(i0, file, 207, 4, 3727);
    			attr_dev(a4, "class", "nav-menu svelte-g2hxqa");
    			add_location(a4, file, 206, 2, 3702);
    			if (!src_url_equal(img.src, img_src_value = "resources/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "id", "navbar-logo");
    			attr_dev(img, "alt", "Logo");
    			attr_dev(img, "class", "svelte-g2hxqa");
    			add_location(img, file, 210, 3, 3800);
    			attr_dev(a5, "class", "nav-logo svelte-g2hxqa");
    			attr_dev(a5, "href", "#home");
    			add_location(a5, file, 209, 2, 3763);
    			attr_dev(nav, "class", "nav svelte-g2hxqa");
    			attr_dev(nav, "id", "navbar");
    			add_location(nav, file, 200, 1, 3463);
    			attr_dev(b, "class", "svelte-g2hxqa");
    			add_location(b, file, 215, 11, 3973);
    			attr_dev(h10, "class", "svelte-g2hxqa");
    			add_location(h10, file, 215, 4, 3966);
    			attr_dev(h11, "class", "svelte-g2hxqa");
    			add_location(h11, file, 216, 4, 3994);
    			attr_dev(p0, "class", "svelte-g2hxqa");
    			add_location(p0, file, 217, 4, 4016);
    			attr_dev(span0, "class", "splash-title svelte-g2hxqa");
    			add_location(span0, file, 214, 2, 3934);
    			attr_dev(div0, "class", "always-visible svelte-g2hxqa");
    			add_location(div0, file, 219, 2, 4064);
    			attr_dev(div1, "class", "splash svelte-g2hxqa");
    			attr_dev(div1, "id", "home");
    			add_location(div1, file, 213, 3, 3901);
    			attr_dev(span1, "class", "anchor svelte-g2hxqa");
    			attr_dev(span1, "id", "about");
    			set_style(span1, "top", "-80px");
    			add_location(span1, file, 226, 2, 4315);
    			attr_dev(h12, "class", "svelte-g2hxqa");
    			add_location(h12, file, 227, 2, 4376);
    			attr_dev(p1, "class", "svelte-g2hxqa");
    			add_location(p1, file, 228, 2, 4396);
    			attr_dev(p2, "class", "svelte-g2hxqa");
    			add_location(p2, file, 238, 2, 4938);
    			attr_dev(p3, "class", "svelte-g2hxqa");
    			add_location(p3, file, 246, 2, 5401);
    			attr_dev(p4, "class", "svelte-g2hxqa");
    			add_location(p4, file, 252, 2, 5709);
    			attr_dev(div2, "class", "about svelte-g2hxqa");
    			add_location(div2, file, 225, 3, 4293);
    			attr_dev(h13, "class", "svelte-g2hxqa");
    			add_location(h13, file, 261, 3, 6183);
    			attr_dev(i1, "class", "fa fa-instagram svelte-g2hxqa");
    			add_location(i1, file, 264, 5, 6327);
    			set_style(a6, "color", "#f56040");
    			attr_dev(a6, "href", "https://www.instagram.com/info1robotics/");
    			attr_dev(a6, "class", "svelte-g2hxqa");
    			add_location(a6, file, 263, 2, 6248);
    			attr_dev(i2, "class", "fa fa-youtube-play svelte-g2hxqa");
    			add_location(i2, file, 269, 5, 6481);
    			set_style(a7, "color", "#ff0000");
    			attr_dev(a7, "href", "https://www.youtube.com/channel/UC6PkNCRNEQOfKuciVltqzTQ");
    			attr_dev(a7, "class", "svelte-g2hxqa");
    			add_location(a7, file, 266, 2, 6378);
    			attr_dev(i3, "class", "fa fa-facebook svelte-g2hxqa");
    			add_location(i3, file, 272, 5, 6610);
    			set_style(a8, "color", "#3b5998");
    			attr_dev(a8, "href", "https://www.facebook.com/info1robotics");
    			attr_dev(a8, "class", "svelte-g2hxqa");
    			add_location(a8, file, 271, 2, 6533);
    			attr_dev(i4, "class", "fa fa-envelope svelte-g2hxqa");
    			add_location(i4, file, 275, 5, 6728);
    			set_style(a9, "color", "#444444");
    			attr_dev(a9, "href", "mailto:info1robotics@gmail.com");
    			attr_dev(a9, "class", "svelte-g2hxqa");
    			add_location(a9, file, 274, 2, 6659);
    			attr_dev(div3, "class", "contact-us svelte-g2hxqa");
    			add_location(div3, file, 262, 3, 6221);
    			attr_dev(div4, "class", "footer svelte-g2hxqa");
    			add_location(div4, file, 279, 3, 6802);
    			attr_dev(main, "class", "svelte-g2hxqa");
    			add_location(main, file, 194, 0, 3264);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, link0);
    			append_dev(main, t0);
    			append_dev(main, link1);
    			append_dev(main, t1);
    			append_dev(main, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t3);
    			append_dev(nav, a1);
    			append_dev(nav, t5);
    			append_dev(nav, a2);
    			append_dev(nav, t7);
    			append_dev(nav, a3);
    			append_dev(nav, t9);
    			append_dev(nav, a4);
    			append_dev(a4, i0);
    			append_dev(nav, t10);
    			append_dev(nav, a5);
    			append_dev(a5, img);
    			append_dev(main, t11);
    			append_dev(main, div1);
    			append_dev(div1, span0);
    			append_dev(span0, h10);
    			append_dev(h10, t12);
    			append_dev(h10, b);
    			append_dev(span0, t14);
    			append_dev(span0, h11);
    			append_dev(span0, t16);
    			append_dev(span0, p0);
    			append_dev(div1, t18);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(main, t19);
    			append_dev(main, div2);
    			append_dev(div2, span1);
    			append_dev(div2, t20);
    			append_dev(div2, h12);
    			append_dev(div2, t22);
    			append_dev(div2, p1);
    			append_dev(div2, t24);
    			append_dev(div2, p2);
    			append_dev(div2, t26);
    			append_dev(div2, p3);
    			append_dev(div2, t28);
    			append_dev(div2, p4);
    			append_dev(main, t30);
    			append_dev(main, h13);
    			append_dev(main, t32);
    			append_dev(main, div3);
    			append_dev(div3, a6);
    			append_dev(a6, i1);
    			append_dev(a6, t33);
    			append_dev(div3, t34);
    			append_dev(div3, a7);
    			append_dev(a7, i2);
    			append_dev(a7, t35);
    			append_dev(div3, t36);
    			append_dev(div3, a8);
    			append_dev(a8, i3);
    			append_dev(a8, t37);
    			append_dev(div3, t38);
    			append_dev(div3, a9);
    			append_dev(a9, i4);
    			append_dev(a9, t39);
    			append_dev(main, t40);
    			append_dev(main, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*ready*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*ready*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function scrollPos() {
    	return typeof window.pageYOffset != 'undefined'
    	? window.pageYOffset
    	: document.documentElement.scrollTop
    		? document.documentElement.scrollTop
    		: document.body.scrollTop ? document.body.scrollTop : 0;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let ready = false;
    	onMount(() => $$invalidate(0, ready = true));

    	window.onload = function () {
    		var navbar_logo = document.getElementById("navbar-logo");
    		var navbar = document.getElementById("navbar");

    		window.onscroll = function () {
    			console.log(document.body.scrollTop);

    			if (scrollPos()) {
    				navbar.classList.add("nav-scroll");
    				navbar_logo.style.height = "48px";
    			} else {
    				navbar.classList.remove("nav-scroll");
    				navbar_logo.style.height = "58px";
    			}
    		};
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fade, fly, onMount, ready, scrollPos });

    	$$self.$inject_state = $$props => {
    		if ('ready' in $$props) $$invalidate(0, ready = $$props.ready);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ready];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
