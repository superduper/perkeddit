angular.module('app.post', ['ui.bootstrap.tabs', 'ngResource', 'angularMoment', 'frapontillo.ex.filters']).
    factory('Post', ['$resource', function($resource){
        return $resource("/api/v1/posts/:postId",
            { postId:'@id' }, {
                vote: {
                    method: "PUT",
                    url: "/api/v1/posts/:postId/vote"
                }
            });
    }]).
    factory('Vote', ['$http', function($http){
        function vote (post, data){
           return $http({
                method: "PUT",
                url: "/api/v1/posts/{0}/vote".format(post.id),
                data: data
            }).then(function(resp){
                post.score = resp.data.new_post_score;
            });
        }
        return {
            upVote: function(post){
                return vote(post, {positive:true})
            },
            downVote: function(post){
                return vote(post, {negative:true})
            }
        }
    }]).
    factory('Comment', ['$http', function($http){
        return {
            newComment: function (post, text){
               return $http({
                    method: "POST",
                    url: "/api/v1/posts/{0}/comment".format(post.id),
                    data: {
                        text: text
                    }
               }).then(function(resp){
                    post.comments.unshift(resp.data);
               });
            }
        }
    }]);

function PostListCtrl($scope, $routeParams, Post, Vote){
    $scope.posts = Post.query({mode:$routeParams.mode});
    $scope.upVote = function(post){
        Vote.upVote(post);
    };
    $scope.downVote = function(post){
        Vote.downVote(post);
    };
}

function NewPostCtrl($scope, $location, Post){
    $scope.submitPost = function(post_form){
        var newPost = new Post(post_form);
        newPost.$save().then(
            function(){
                $location.path("/post/"+newPost.id);
            },
            function(err){
                console.log(err);
            }
        );

    };
}

function ReadPostCtrl($scope, $routeParams, Post, Vote, Comment){
    var post = Post.get({postId: $routeParams.postId});
    $scope.post = post;
    $scope.upVote = function(){
        Vote.upVote(post);
    };
    $scope.downVote = function(){
        Vote.downVote(post);
    };
    $scope.submitComment = function(text){
        Comment.newComment(post, text);
    }
}