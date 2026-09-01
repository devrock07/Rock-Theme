// Copyright (c) 2015 - 2017 Dane Everitt <dane@daneeveritt.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
$.urlParam = function (name) {
    return new URLSearchParams(window.location.search).get(name);
};

function getPageName(url) {
    var index = url.lastIndexOf('/') + 1;
    var filenameWithExtension = url.substr(index);
    return filenameWithExtension.split('.')[0];
}

// Remember the active tab and navigate to it on reload without assigning
// untrusted query-string keys onto a plain JavaScript object.
var queryParameters = new URLSearchParams(window.location.search);
$("a[data-toggle='tab']").click(function () {
    queryParameters.set('tab', $(this).attr('href').substring(1));
    var query = queryParameters.toString();
    window.history.pushState(null, null, location.pathname + (query ? '?' + query : ''));
});

var activeTab = $.urlParam('tab');
if (activeTab !== null) {
    $('.nav.nav-tabs a')
        .filter(function () {
            return $(this).attr('href') === '#' + activeTab;
        })
        .first()
        .tab('show');
}
