var Reflux = require('reflux'),
    getParagraph = require('./getParagraph'),
    finalMentionsArray = require('./finalMentionsArray'),
    finalMenuJsonArray = require('./finalMenuJsonArray'),
    finalListJsonArray = require('./finalListJsonArray'),
    scriptsStorage = require('./scripts');

module.exports = Reflux.createStore({
    init: function() {
        var self = this;
        this.listenTo(scriptsStorage, function (data) {
            self.trigger(
                self.parse(data)
            );
        });
    },
    getInitialState: function () {
        return [];
    },
    parse: function (json, hasPart, finalJsonArray) {
        var
            i,
            j,
            comment,
            mentions,
            mention,
            name;

        finalJsonArray = finalJsonArray || [];

        if (hasPart === undefined) {
            hasPart = false;
        }

        for (j = 0; j < json.length; j += 1) {
            comment = json[j];
            var isArticle = false;
            if(comment['@type'] === 'Article'){
                isArticle = true;
            }

            mentions = comment.mentions;
            if (mentions !== undefined) {
                for (i = 0; i < mentions.length; i += 1) {
                    mention = mentions[i];
                    name = mention.name;
                    var nameWithoutSpace = name.replace(/\s/g, '-');
                    var mentionUrl = mention.url;
                    var mentionUrlComponent = mentionUrl.split('\'');
                    var linkWord = mentionUrlComponent[1];
                    var res2 = mentionUrlComponent[2].split(',');
                    var res3 = res2[0].split(':');
                    var newUrl = mentionUrlComponent[0] + nameWithoutSpace;
                    finalMentionsArray.push({
                        name: name,
                        url: mentionUrl,
                        linkWord: linkWord,
                        newUrl: newUrl,
                        paragraphNo: res3[1],
                        paragraphLine: parseInt(res2[1])
                    });
                }
            }

            // for menu
            if(comment['@type'] === 'Article'){
                name = comment.name;
                finalMenuJsonArray.push({
                    'name': name,
                    'url': '',
                    'class': 'articleView'
                });
            } else if (comment['@type'] === 'ItemList') {
                if(comment.itemListElement !== undefined) {
                    for (i = 0; i < comment.itemListElement.length; i += 1) {
                        name = comment.itemListElement[i].name;
                        var url = comment.itemListElement[i].url;
                        finalMenuJsonArray.push({
                            'name': name,
                            'url': url,
                            'class': 'listView'
                        });
                    }
                }
            }
            //end menu array

            // for list
            if (comment.itemListElement !== undefined) {
                for (i = 0; i < comment.itemListElement.length; i += 1) {
                    name = comment.itemListElement[i].name;
                    var about = comment.itemListElement[i].about;
                    url = comment.itemListElement[i].url;
                    var image = comment.itemListElement[i].image;
                    var description = comment.itemListElement[i].description;
                    finalListJsonArray.push({
                        'name': name,
                        'author': comment.name,
                        'about': about,
                        'description': description,
                        'url': url,
                        'image': image
                    });
                }
            }
            // for list

            var articlebody = comment.articleBody || '';
            var newArticle = '';
            for (i = 0; i < articlebody.length; i += 1) {
                var articleParagraph = articlebody[i];
                var article = getParagraph(articleParagraph); // for get paragraph with link
                newArticle += '<p>' + article + '</p>';
            }
            var articlurl = comment.url || '';
            finalJsonArray.push({
                'is_article': isArticle,
                'articlename': comment.name,
                'articleBody': newArticle,
                'url': articlurl,
                'about': comment.about,
                'hasPart': hasPart
            });
            if(comment.hasPart !== undefined){
                if (comment.hasPart.length > 0) {
                    this.parse(comment.hasPart, true, finalJsonArray);
                }
            }
        }
        return finalJsonArray;
    }
});
