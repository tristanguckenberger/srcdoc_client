/**
 * 
 * @param {*} unsortedComments 
 * @returns 
 */
export function sortComments(unsortedComments) {
    if (unsortedComments?.length > 0) {
        unsortedComments?.map((x) => {
            x.isMember = false;
            return x;
        });
        let updateCL = unsortedComments?.slice();
        updateCL?.forEach((comment) => {
            if (!comment?.parentId) comment.parentId = null;
        });
        const nested = updateCL?.reduce(
            (initial, value, index, original) => {
                if (value?.parentId) {
                    let parentFound = findParent(initial?.nested, value);
                    if (parentFound) {
                        checkLeftOvers(initial?.left, value);
                    } else {
                        initial?.left?.push(value);
                    }
                } else {
                    if (initial?.left?.length) {
                        checkLeftOvers(initial?.left, value);
                    }
                    delete value?.parentId;
                    value.root = true;
                    initial?.nested?.push(value);
                }
                return index < original?.length - 1 ? initial : initial?.nested;
            },
            { nested: [], left: [] }
        );

        return nested;
    }
}

/**
 * 
 * @param {*} leftOvers 
 * @param {*} possibleParent 
 */
export function checkLeftOvers(leftOvers, possibleParent) {
    let leftOversLen = leftOvers?.length;
    let parentChildren = possibleParent?.children || [];

    for (let i = 0; i < leftOversLen; i++) {
    if (leftOvers[i]?.parentId === possibleParent?.id) {
        delete leftOvers[i]?.parentId;
        parentChildren
            ? parentChildren?.push(leftOvers[i])
            : (parentChildren = [leftOvers[i]]);
        possibleParent.count = parentChildren.length;
        const addedObj = leftOvers.splice(i, 1);
        checkLeftOvers(leftOvers, addedObj[0]);
    }
    }
}

/**
 * 
 * @param {*} possibleParents 
 * @param {*} possibleChild 
 * @returns boolean 'found'
 */
export function findParent(possibleParents, possibleChild) {
    let possibleParent = possibleChild?.parentId;
    let found = false;
    for (let i = 0; i < possibleParents?.length; i++) {
    if (possibleParents[i]?.id === possibleParent) {
        found = true;
        try {
        delete possibleChild?.parentId;
        } catch (error) {
            console.error(error)
        }
        
        if (possibleParents[i]?.children) {
        possibleParents[i]?.children?.push(possibleChild);
        } else {
        possibleParents[i].children = [possibleChild];
        possibleParents[i].count = possibleParents[i]?.children?.length;
        return true;
        } 
    } else if (possibleParents[i].children)
        found = findParent(possibleParents[i].children, possibleChild);
    }
    return found;
}

export function processPostData(postData) {
    // console.log(postData)
    return {
        id: postData?.data?.id,
        authorID: postData?.data?.user,
        postTitle: postData?.data?.title,
        postBlurb: postData?.data?.text,
        currentPageID: null,
    };
};
export function pageArrBuilder(page) {
    let mappedData = page?.data?.map((project) => {

        const rBody = project?.replBody;
        let components;

        if (!rBody?.files) return;
        
        components = replBuilder(rBody);
        let id = project?.id;
        let pid = project?.post;

        let files = replCodeMapper(components);
        let { html, css, js } = files;

        return {
            id,
            pid,
            pageTitle: project.title,
            text: project.text ? project.text : project.description,
            html,
            css,
            js
        };
    });
    return mappedData;
};
export function replBuilder(replBody) {
    let components = Object.keys(replBody.files).map((key) => {
        const n = replBody.files[key].name;
        const joinerIndex = n.indexOf('.');
        const type = n.includes('.') ? n.slice(joinerIndex + 1, n.length) : n;
        const name = n.includes('.') ? n.slice(0, joinerIndex) : 'index';
        const s = replBody.files[key].source;
        const source = s.replace(/&lt;/gi, '<') || '';
        return {
            type,
            name,
            source
        };
    });
    return components;
};
export function replCodeMapper(components) {
    let html;
    let css;
    let js;

    components.forEach((x) => {
        if (x.type === 'html') {
            html = {
                source: x.source,
                type: 'html'
            };
        }
        if (x.type === 'css') {
            css = {
                source: x.source,
                type: 'css'
            };
        }
        if (x.type === 'typescript') {
            js = {
                source: x.source,
                type: 'typescript'
            };
        }
    });

    return { html, css, js };
};