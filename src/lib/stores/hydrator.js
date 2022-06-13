import { writable } from "svelte/store";

function sortComments(unsortedComments) {

	console.log('unsortedComments')
	console.log(unsortedComments)
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
						console.log('parent found?')
						let parentFound = findParent(initial?.nested, value);
						if (parentFound) {
							console.log('parent found.')
							checkLeftOvers(initial?.left, value);
						} else {
							initial?.left?.push(value);
						}
					} else {
						console.log('no parent found')
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

function checkLeftOvers(leftOvers, possibleParent) {
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
        console.log(addedObj)
        checkLeftOvers(leftOvers, addedObj[0]);
    }
    }
}

function findParent(possibleParents, possibleChild) {
    let possibleParent = possibleChild?.parentId;
    let found = false;
    for (let i = 0; i < possibleParents?.length; i++) {
        console.log(possibleParents[i]?.id === possibleParent)
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

function getComments(id) {
    const fetchURL = `../../api/comment/getComments/${id}.json`;
    return fetch(fetchURL, {
        method: 'GET'
    });
}

// api hydrator func w/ local storage
const asyncReadable = (initial, loadFunction) => {
    let loadPromise;
    const loadValue = async (id, set, reload) => {
        if (!loadPromise || reload) {
            console.log('the id is:')
            console.log(id)
            loadPromise = loadFunction(id);
        }

        const storeValue = await (await loadPromise).json();
        // const newStoreVal = await storeValue.json();
        let nestedComments;

        if (storeValue) nestedComments = sortComments(storeValue)


        set(nestedComments ?? storeValue);
        return (nestedComments ?? storeValue);
    };
    const { subscribe, set } = writable(initial, (set) => {
        loadValue(set);
    });
    return {
        subscribe,
        load: (id) => loadValue(id, set),
        reload: (id) => loadValue(id, set, true),
        // useLocalStorage: () => {
        //     const json = localStorage.getItem(key);
        //     if (json) {
        //       set(JSON.parse(json));
        //     }
      
        //     subscribe((current) => {
        //       localStorage.setItem(key, JSON.stringify(current));
        //     });
        //   },
    };
};

export const commentSubscriber = writable('');

export const commentHydrator = asyncReadable([], getComments);
