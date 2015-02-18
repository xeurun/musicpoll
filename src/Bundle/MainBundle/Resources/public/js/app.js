$(document).ready(function() {
    var token = '71fcc118d02b311e47dbbc57f315952a3080a5fb68cf4f283107d18e971999f5e1fe61f53b1a7b58f39d9',
        api = 'https://api.vk.com/method/_method_',
        showPopup = function(type, message) {
            $('#popup-message').removeClass('alert-success');
            $('#popup-message').removeClass('alert-info');
            $('#popup-message').removeClass('alert-danger');
            var header = '';
            switch(type) {
                case 'success':
                    header = 'Выполнено';
                    $('#popup-message').addClass('alert-success');
                    break;
                case 'info':
                    header = 'Внимание';
                    $('#popup-message').addClass('alert-info');
                    break;
                case 'error':
                    header = 'Ошибка';
                    $('#popup-message').addClass('alert-danger');
                    break;
                default:
            }
            $('#popup-message').find('strong').text(header);
            $('#popup-message').find('span').text(message);
            $('#popup-message').show();
            $('#popup-message').fadeOut(7000);
        },
        reindex = function() {
            tinysort('ul#poll>li', {
                data:'count',
                order:'desc'
            });
            $('#poll').masonry('reloadItems');
            $('#poll').masonry();
            $('li').removeClass('top');
            $('li').first().addClass('top');
        },
        type = 'vk';

    $('#poll').masonry({
        itemSelector: '.panel',
        gutter: 10,
        stamp: ".top"
    });
    if($('#poll > li').length > 0) {
        reindex();
    }

    $('body').on('click', '.js-play-song', function() {
        $(this).closest('li').find('.panel-footer').clone().replaceAll("#player .modal-body > div");
        $("#player").find('audio').trigger('play');
        $("#player").modal('show');
    });

    $('#player').on('hide.bs.modal', function (event) {
        $("#player").find('audio').trigger('pause');
    });

    $('#add-modal').on('shown.bs.modal', function () {
        $("#player").append($(this).closest('li'));
    });

    $('select').not('.js-ajax-select').select2().on("select2:select", function (e) {
        type = $(this).val();
        switch(type) {
            case 'vk':
                    $('.js-ajax-select').parent().show();
                break;
            case 'url':
            case 'img':
            case 'yt':
            default:
                $('.js-ajax-select').parent().hide();
                $('#preview-player').hide();
        }
    });
    $('select.js-ajax-select').select2({
        placeholder: 'Начните вводить название песни',
        allowClear: true,
        ajax: {
            url: api.replace('_method_', 'audio.search'),
            dataType: 'jsonp',
            delay: 250,
            data: function (params) {
                return {
                    q: params.term,
                    auto_complete: 1,
                    access_token: token,
                    v: '5.28'
                };
            },
            processResults: function (data, page) {
                return {
                    results: $.map(data.response.items, function (item) {
                        return {
                            text: item.title.length > 30 ? (item.title.substring(0, 30) + '...') : item.title,
                            url: item.url,
                            id: item.id
                        }
                    })
                };
            },
            cache: false
        },
        minimumInputLength: 2
    }).on("select2:select", function (e) {
        var url = e.params.data.url;
        if(url && url.length) {
            $('#song-title').val(e.params.data.text);
            $('#song-url').val(e.params.data.url);
            $('#song-url').prop('readonly', true);
            $('#song-url').change();
        } else {
            $('#song-url').prop('readonly', false);
            $('#preview-player').hide();
        }
    }).on("select2:unselect", function (e) {
        $('#song-url').prop('readonly', false);
        $('#preview-player').hide();
    });

    $('#song-url').on('keydown change', function(e) {
        var self = this;
        if(type != 'vk') {
            return;
        }
        setTimeout(function(){
            $('#preview-player').attr("src", $(self).val());
            $('#preview-player').show();
        }, 1000);
    });
    realplexor.registerCallback("Add", function (result) {
        return function (result, id) {
            $('#poll').append(result);
            reindex();
        };
    });
    realplexor.registerCallback("Update", function (result) {
        return function (result, id) {
            var selector = '.item-' + result['id'];
            $(selector).find('.js-counter').text(result['count']);
            $(selector).attr('data-count', result['count']);
            reindex();
        };
    });
    realplexor.registerCallback("Remove", function (result) {
        return function (result, id) {
            $('.item-' + result['id']).remove();
            reindex();
        };
    });
    realplexor.subscribeChannel("Add_Song");
    realplexor.subscribeChannel("Update_Song");
    realplexor.subscribeChannel("Remove_Song");
    realplexor.startListen();
    $("form").submit(function(e)
    {
        var postData = $(this).serializeArray();
        var formURL = $(this).attr("action");
        $.ajax(
            {
                url : formURL,
                type: "POST",
                data : postData,
                success:function(data, textStatus, jqXHR)
                {
                    if(data.view) {
                        showPopup('success', 'Музыка добавлена!');
                        $('#add-modal').modal('hide');
                    } else {
                        showPopup('error', 'Ошибка!');
                    }
                },
                error: function(jqXHR, textStatus, errorThrown)
                {
                    showPopup('error', 'Ошибка!');
                }
            });
        e.preventDefault();
    });
    $('.js-ajax-form').on('click', function() {
        $("form").submit();
    });
    $('body').on('click', '.js-ajax', function() {
        $.ajax({
            url: $(this).data('url'),
            type: "POST",
            beforeSend: function(){
            },
            success: function(data) {
                if (data.count != undefined) {
                    showPopup('success', 'Голос учтен!');
                } else if (data.error) {
                    showPopup('error', data.error);
                }
            },
            complete: function() {
            }
        });
    });
});