//Handle expend
let isLoading = false;
$(document).on('click', '.svg.des', async function () {
    if (isLoading == true) { return }
    isLoading = true
    const id = $(this).data('id');
    const $article = $('#' + id)
    const expendDisplay = $article.find('.expend').css('display')
    if (expendDisplay == 'block') {
        $article.find('.non-expend').css('display', 'flex').end()
            .find('.expend').css('display', 'none').end()
        $article.find('.svg').eq(0).css('display', 'block');
        $article.find('.svg').eq(1).css('display', 'none');
        $article.find('.commentList').empty().css('display', 'none')
        const $operation = $article.find('.article-operations .operation')
        $operation.eq(1).removeClass('active')
        $article.find('.comment').css('display', 'none')
    } else {
        const res = await fetchData(`/article/des/${id}`)
        if (res.code == 0) {
            const $operation = $article.find('.article-operations .operation')
            $operation.eq(2).find('a').text('view (' + res.data.view + ')');
            $operation.eq(1).find('a').text('comment (' + res.data.comment + ')');
            if (res.data.favorite) {
                const $fav = $operation.eq(0)
                $fav.addClass('active');
                $fav.prop('disabled', true);
            } else {
                const $fav = $operation.eq(0)
                $fav.removeClass('active');
                $fav.prop('disabled', false);
            }
            if (res.data.user.sub) {
                const $comment = $article.find('.comment')
                const avatar = res.data.user.nickname?.charAt(0)?.toUpperCase() || ""
                $article.find('.avatar').text(avatar)
            }

            $article.find('.non-expend')
                .css('display', 'none').end()
                .find('.expend').css('display', 'block').end()
            $article.find('.svg').eq(0).css('display', 'none');
            $article.find('.svg').eq(1).css('display', 'block');
        }
    }
    isLoading = false
})


//Handle favorite
$(document).on('click', '.operation.favorite', async function () {
    const articleId = $(this).data('id');
    $(this).prop('disabled', true);
    const res = await fetchData(`/article/favorite/${articleId}`)
    if (res.code == 0) { $(this).addClass('active'); }
    else { $(this).prop('disabled', false); }
})


//Handle favorite in mini
$(document).on('click', '.mini-operation', async function () {
    $(this).prop('disabled', true);
    const articleId = $(this).data('article')
    const res = await fetchData(`/article/favorite/${articleId}`)
    if (res.code == 0 && res.data) {
        $(this).addClass('active');
        $(this).removeClass('inactive');
        $(this).find('a').text('favorite')
    }
    if (res.code == 0 && !res.data) {
        $(this).removeClass('active');
        $(this).addClass('inactive');
        $(this).find('a').text('remove')
    }
    $(this).prop('disabled', false)
})


//Handle more in mini
$(document).on('click', '.mini-more', async function () {
    const articleId = $(this).data('id')
    window.location.href = `/article/page/${articleId}`
})


//Handle comment tab
$(document).on('click', '.operation.cmt', async function () {
    const id = $(this).data('id');
    const $article = $('#' + id)
    $(this).prop('disabled', true);
    const status = $(this).hasClass('active')

    //close
    if (status) {
        $article.find('.commentList').empty().css('display', 'none')
        $article.find('.comment').css('display', 'none')
        $(this).removeClass('active')
        $(this).prop('disabled', false);
        return
    }
    //open
    getCommentList(this, id, $article)
})


//Handle comment textarea
$(document).on('focus', '.cmt-textarea', function () {
    $(this).next('button').show()
})

$(document).on('blur', '.cmt-textarea', function () {
    const val = $(this).val().trim()
    if (!val) {
        $(this).next('button').hide()
    }
})

$(document).on('input', '.cmt-textarea', function () {
    const val = $(this).val()
    if (val.length > 0) {
        $(this).next('button').prop('disabled', false);
    } else {
        $(this).next('button').prop('disabled', true);
    }
})

//Handle comment button
$(document).on('click', '.cmt-button', async function () {
    $(this).prop('disabled', true);
    const id = $(this).data('id');
    const $article = $('#' + id)
    const $content = $article.find('.cmt-textarea')
    $content.prop('disabled', true)
    $(this).find('.spinner').show()
    $(this).find('svg').hide()
    const $button = $article.find('.operation.cmt')
    const content = $content.val()
    const res = await fetchData('/article/comment', 'POST', { articleId: id, content })
    if (res.code == 0) {
        $content.val('')
        await getCommentList($button, id, $article)
    }
    $(this).prop('disabled', false);
    $content.prop('disabled', false);
    $content.val('')
    $(this).find('.spinner').hide()
    $(this).find('svg').show()
})

//Handle delete
$(document).on('click', '.commentDelete', async function () {
    const articleId = $(this).data('articleid')
    const commentId = $(this).data('id')
    const res = await fetchData('/article/comment/', 'DELETE', { commentId })
    if (res.code == 0) {
        const $article = $('#' + articleId)
        const $button = $article.find('.operation.cmt')
        await getCommentList($button, articleId, $article)
    }
})


//Get comment list  function

async function getCommentList(_this, id, $article) {
    const res = await fetchData('/article/comment/', 'GET', { articleId: id, commentId: id })
    if (res.code == 0) {
        let commentList = ""
        if (res.data.commentList.length > 0) {
            res.data.commentList.forEach((item, index) => {
                commentList = commentList + `<div class="commentItem">
                            <div class="commentAvatar">${item?.userId?.nickname?.charAt(0)?.toUpperCase()}</div>
                            <div class="commentContext">
                               <a class="commentNickname">${item.userId.nickname}</a>
                               <span class="commentContent">${!item.delete ? item.content : 'This comment has been deleted'}</span>
                               <div class="commentCreatedAt">
                                 <a>${item.createdAt}</a>
                                 ${item.userId._id == res.data.userId && !item.delete ? '<a class="commentDelete" data-id=' + item._id + ' data-articleId=' + id + '>DELETE</a>' : '<a></a>'}
                               </div >
                ${item.hasReplies ? '<button class="commentReply"><span>View all ' + item.replyCount + ' replies</span></button>' : ''}
                            </div >
                        </div > `
            })
            if (res.data.commentTotal > 3) { commentList = commentList + `<div class="commentMore"><a data-id=${id} style="cursor:pointer" class="moreComment">View all ${res.data.commentTotal} comments</a></div>` }
        } else {
            commentList = "<div>No comments yet.</div>"
        }
        if (res.data.userId) { $article.find('.comment').css('display', 'flex') }
        $article.find('.commentList').empty().append(commentList).css('display', 'block')
        const $operation = $article.find('.article-operations .operation')
        $operation.eq(1).find('a').text('comment (' + res.data.commentTotal + ')');
        $(_this).addClass('active')
        $(_this).prop('disabled', false);
    }
}


//Handle comment more
$(document).on('click', '.moreComment', function () {
    const articleId = $(this).data('id')
    window.location.href = `/article/page/${articleId}`
})


