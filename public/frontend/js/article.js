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
    } else {
        const res = await fetchData(`/article/des/${id}`)
        if (res.code == 0) {
            if (res.data.favorite) {
                const $fav = $article.find('.operation.favorite');
                $fav.addClass('active');
                $fav.prop('disabled', true);
            } else {
                const $fav = $article.find('.operation.favorite');
                $fav.removeClass('active');
                $fav.prop('disabled', false);
            }
            const $fav = $article.find('.operation.view');
            $fav.find('a').text('view (' + res.data.view + ')');
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
