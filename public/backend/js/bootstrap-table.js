


function initDataTable(tableId, url, columnsConfig) {
    let keyword = ""
    const table = $(tableId).DataTable({
        paging: true,
        searching: false,
        ordering: true,
        info: true,
        pageLength: 20,
        "scrollY": "calc(100vh - 500px)",        // 这里设置你想要的表格内容高度
        "scrollCollapse": true,    // 如果数据不足 20 条，高度会自动缩小
        "scrollX": true,           // 开启横向滚动防止错位
        dom: '<"table-inner-wrapper"tip>',
        language: {
            lengthMenu: "",
            info: "Showing _START_ to _END_ of _TOTAL_ entries",
            infoEmpty: "Showing 0 to 0 of 0 entries",
            search: "Search:",
            paginate: {
                previous: "Previous",
                next: "Next"
            }
        },
        serverSide: true,
        ajax: function (data, callback, settings) {
            const page = settings._iDisplayStart / settings._iDisplayLength + 1;
            const limit = settings._iDisplayLength;
            fetchList(page, limit, url, keyword).then(response => {
                callback({
                    draw: settings.iDraw,
                    recordsTotal: response.totalRecords,
                    recordsFiltered: response.totalRecords,
                    data: response.data,
                });
            });
            $('html, body').animate({ scrollTop: 0 });
        },
        columns: columnsConfig,
    });

    table.setKeyword = function (value) {
        keyword = value;
    };
    return table
}

async function fetchList(page, limit, url, keyword) {
    const response = await fetchData(url, 'GET', { page, limit, keyword });
    if (response.data.lang) $('#bootstrap-data-table').attr('data-lang', JSON.stringify(response.data.lang))
    return {
        data: response.data.list,
        totalRecords: response.data.total,
    };
}

