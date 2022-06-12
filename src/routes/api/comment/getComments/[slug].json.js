import * as api from '$lib/api.js';

export async function get({ params }) {

    // const res = await api.get(params.slug === "/all" ? `api/v2/comments` : `api/v2/comments?${params.slug}`);
    const response = await api.get(`api/v2/posts/${params.slug}/comments`);

    // const parsed = await response.json();
    // if (typeof parsed.error !== "undefined") {
    //   throw new Error(parsed.error);
    // }
    console.log('==================')
    console.log('==================')
    console.log('==================')
    console.log('==================')
    console.log('==================')
    console.log('==================')
    console.log(response)
    console.log('==================')
    console.log('==================')
    console.log('==================')
    console.log('==================')
    console.log('==================')
    console.log('==================')
    console.log('==================')

    const postComments = response.data;
    let nested;

    if (postComments && postComments.length > 0) {
      postComments.map((x) => {
        //   let modMap = mods.data.filter((y) => y.userID === x.user);
        //   if (modMap.length >= 1) {
        //     x.isMember = true;
        //     return x;
        //   }
          x.isMember = false;
          return x;
        });


      // move nestComments functionality here -----
      let updateCL = postComments.slice();
      updateCL.forEach((comment) => {
        if (!comment.hasOwnProperty("parentId")) {
          comment.parentId = null;
        }
      });
      nested = updateCL.reduce(
        (initial, value, index, original) => {
          if (value.parentId === null) {
            if (initial.left.length) checkLeftOvers(initial.left, value);
            delete value.parentId;
            value.root = true;
            initial.nested.push(value);
          } else {
            let parentFound = findParent(initial.nested, value);
            if (parentFound) checkLeftOvers(initial.left, value);
            else initial.left.push(value);
          }
          return index < original.length - 1 ? initial : initial.nested;
        },
        { nested: [], left: [] }
      );
    }




    function checkLeftOvers(leftOvers, possibleParent) {
      let leftOversLen = leftOvers.length;
      let parentChildren = possibleParent.children || [];
      for (let i = 0; i < leftOversLen; i++) {
        if (leftOvers[i].parentId === possibleParent.id) {
          delete leftOvers[i].parentId;
          parentChildren
            ? parentChildren.push(leftOvers[i])
            : (parentChildren = [leftOvers[i]]);
          possibleParent.count = parentChildren.length;
          const addedObj = leftOvers.splice(i, 1);
          checkLeftOvers(leftOvers, addedObj[0]);
        }
      }
    }
    function findParent(possibleParents, possibleChild) {
      let possibleParent = possibleChild.parentId;
      let found = false;
      for (let i = 0; i < possibleParents.length; i++) {
        if (possibleParents[i].id === possibleParent) {
          found = true;
          delete possibleChild.parentId;
          if (possibleParents[i].children) {
            possibleParents[i].children.push(possibleChild);
          } else {
            possibleParents[i].children = [possibleChild];
            possibleParents[i].count = possibleParents[i].children.length;
            return true;
          } 
        } else if (possibleParents[i].children)
          found = findParent(possibleParents[i].children, possibleChild);
      }
      return found;
    }



    return {
        status: 200,
        body: nested
    }
}
