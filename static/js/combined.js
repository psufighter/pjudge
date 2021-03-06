angular.module("announcementModule", ["helperModule"]).controller("announcementCtrl", ["$scope", "$http", "$sce", "Helper", function(b, d, a, c) {
    b.isWorking = false;
    b.currPageNum = 1;
    b.numOfAnnouncement = 5;
    b.announcementCount = 0;
    b.totalPage = 0;
    b.announcements = {};
    b.pages = {};
    b.announcementData = undefined;
    b.prevPage = function() {
        if (b.currPageNum > 1) {
            b.currPageNum--;
            b.populateAnnouncements()
        }
    }
    ;
    b.nextPage = function() {
        if (b.currPageNum < b.totalPage) {
            b.currPageNum++;
            b.populateAnnouncements()
        }
    }
    ;
    b.populateAnnouncements = function(e) {
        if (e !== undefined && !isNaN(e)) {
            b.currPageNum = e
        }
        d.post("/announcement/view/" + b.currPageNum).success(function(f) {
            b.announcements = f
        }).error(function(f) {
            console.log("error: " + f)
        });
        d.post("/announcement/count").success(function(f) {
            b.announcementCount = f;
            b.totalPage = Math.ceil(b.announcementCount / b.numOfAnnouncement);
            b.pages = c.getPageArr(b.currPageNum, b.totalPage)
        }).error(function(f) {
            console.log("error: " + f)
        })
    }
    ;
    b.parseToHTML = function(e) {
        return c.parseToHTML(a, e)
    }
    ;
    b.addAnnouncement = function() {
        b.isWorking = true;
        var e = new FormData();
        angular.forEach(b.announcementData, function(g, f) {
            this.append(f, g)
        }, e);
        $.ajax({
            type: "POST",
            url: "/announcement/tools/add",
            data: e,
            contentType: false,
            processData: false,
            cache: false,
            success: function(f) {
                b.$apply(function() {
                    b.msg = f;
                    b.isWorking = false
                })
            },
            error: function(f) {
                b.isWorking = false;
                console.log("error");
                console.log(f)
            }
        })
    }
    ;
    b.updateAnnouncement = function() {
        b.isWorking = true;
        var e = new FormData();
        angular.forEach(b.announcementData, function(g, f) {
            this.append(f, g)
        }, e);
        $.ajax({
            type: "POST",
            url: "/announcement/tools/update",
            data: e,
            contentType: false,
            processData: false,
            cache: false,
            success: function(f) {
                b.$apply(function() {
                    b.msg = f;
                    b.isWorking = false
                })
            },
            error: function(f) {
                b.isWorking = false;
                console.log("error");
                console.log(f)
            }
        })
    }
    ;
    b.populateAnnouncementsForTools = function() {
        d.post("/announcement/tools/data/announcement").success(function(e) {
            b.announcements = e
        }).error(function(e) {
            console.log("error");
            console.log(e)
        })
    }
}
]);
angular.module("clarificationModule", ["userModule", "helperModule"]).service("UnreadSvc", [function() {
    return {
        unreadIds: [],
        setUnreads: function(a) {
            this.unreadIds = a
        },
        getUnreads: function() {
            return this.unreadIds
        }
    }
}
]).controller("ClarificationCtrl", ["$scope", "$routeParams", "$http", "Helper", "UserDataSvc", "UnreadSvc", function(b, d, f, c, e, a) {
    b.unreads = [];
    b.clarifications = [];
    b.clarificationData = {};
    b.allowedToAnswer = null ;
    b.msg = "";
    b.skipAdding = false;
    b.hasCheckedUser = false;
    b.isWorking = false;
    b.isCollapsed = {};
    b.$watch(function() {
        return a.getUnreads()
    }, function() {
        if (a.unreadIds !== undefined) {
            if (!b.skipAdding) {
                var g = a.unreadIds[0];
                if (!isNaN(g)) {
                    b.loadClarificationById(g, false)
                }
            } else {
                b.skipAdding = false
            }
        }
    }, true);
    b.$watch(function() {
        return e.getData()
    }, function() {
        if (e.getData() !== undefined && !b.hasCheckedUser) {
            b.hasCheckedUser = true;
            b.checkIfAllowedToAnswer()
        }
    }, true);
    b.toggleClarificationCollapse = function(g) {
        if (b.isCollapsed[g] === undefined || b.isCollapsed[g] === null ) {
            b.isCollapsed[g] = false
        }
        b.isCollapsed[g] = !b.isCollapsed[g]
    }
    ;
    b.loadContestData = function() {
        f.post("/announcement/contest/view/" + d.contestId).success(function(g) {
            b.contestData = g
        }).error(function(g) {
            console.log("error");
            console.log(g)
        })
    }
    ;
    b.loadContestProblem = function() {
        f.post("/problem/contest/" + d.contestId).success(function(h) {
            b.problems = h;
            if (b.problems !== undefined && b.problems !== null  && b.problems !== "") {
                b.problems.sort(function g(j, i) {
                    if (j.problemCode < i.problemCode) {
                        return -1
                    }
                    if (j.problemCode > i.problemCode) {
                        return 1
                    }
                    return 0
                });
                b.problems.unshift({
                    problemId: 0,
                    problemCode: 0,
                    title: "General"
                })
            }
        }).error(function(g) {
            console.log("error");
            console.log(g)
        })
    }
    ;
    b.sendClarification = function() {
        if (b.clarificationData.problemId === undefined || b.clarificationData.problemId === null  || b.clarificationData.problemId === "" || b.clarificationData.subject === null  || b.clarificationData.subject === undefined || b.clarificationData.subject === "" || b.clarificationData.question === undefined || b.clarificationData.question === "" || b.clarificationData.question === null ) {
            b.msg = "Please fill all the fields to request for a clarification";
            return
        }
        var g = {
            contestId: d.contestId,
            problemId: b.clarificationData.problemId,
            subject: b.clarificationData.subject,
            question: b.clarificationData.question
        };
        if (g.problemId !== undefined && g.subject !== undefined && g.question !== undefined && g.contestId !== undefined) {
            b.isWorking = true;
            f.post("/announcement/contest/clarification/send", g).success(function(h) {
                h = parseInt(h);
                if (h !== null  && h !== "" && h !== undefined && h !== NaN) {
                    if (h >= 0) {
                        b.loadClarificationById(h, true)
                    } else {
                        if (h == -1) {
                            b.msg = "Must be logged in to request for a clarification"
                        } else {
                            if (h == -2) {
                                b.msg = "You are not registered in this contest"
                            } else {
                                if (h == -3) {
                                    b.msg = "Contest is not running"
                                }
                            }
                        }
                    }
                }
                b.isWorking = false
            }).error(function(h) {
                console.log("error");
                console.log(h);
                b.isWorking = false
            })
        }
    }
    ;
    b.sendAnnouncement = function() {
        var g = {
            contestId: d.contestId,
            problemId: b.clarificationData.problemId,
            subject: b.clarificationData.subject,
            answer: b.clarificationData.announcement
        };
        if (g.problemId !== undefined && g.subject !== undefined && g.answer !== undefined && g.contestId !== undefined) {
            b.isWorking = true;
            f.post("/announcement/contest/clarification/announcement", g).success(function(h) {
                if (h !== null ) {
                    b.loadClarificationById(h, true)
                }
                b.isWorking = false
            }).error(function(h) {
                console.log("error");
                console.log(h);
                b.isWorking = false
            })
        }
    }
    ;
    b.loadAllClarification = function() {
        var g = {
            contestId: d.contestId
        };
        f.post("/announcement/contest/clarification/list", g).success(function(k) {
            b.unreads = [];
            b.clarifications = k;
            if (k !== null  && k !== "" && k !== undefined) {
                var h = c.getCookie("readAnnouncement_" + d.contestId);
                if (h !== undefined) {
                    h = JSON.parse(h)
                }
                for (var j = 0; j < k.length; j++) {
                    if (k[j].status === "Announcement") {
                        if (h !== undefined) {
                            if (h.indexOf(k[j].clarificationId) === -1) {
                                b.unreads.unshift(k[j].clarificationId)
                            } else {
                                b.clarifications[j].isRead = true
                            }
                        } else {
                            b.unreads.unshift(k[j].clarificationId)
                        }
                    } else {
                        if (k[j].isRead === false) {
                            b.unreads.unshift(k[j].clarificationId)
                        }
                    }
                }
            }
            a.setUnreads(b.unreads)
        }).error(function(h) {
            console.log("error");
            console.log(h)
        })
    }
    ;
    b.loadAllClarificationSpecial = function() {
        var g = {
            contestId: d.contestId
        };
        f.post("/announcement/contest/clarification/list/all", g).success(function(k) {
            b.unreads = [];
            b.clarifications = k;
            if (k !== null  && k !== undefined && k !== "") {
                var h = c.getCookie("readAnnouncement_" + d.contestId);
                if (h !== undefined) {
                    h = JSON.parse(h)
                }
                for (var j = 0; j < k.length; j++) {
                    if (k[j].status === "Announcement") {
                        if (h !== undefined) {
                            if (h.indexOf(k[j].clarificationId) === -1) {
                                b.unreads.unshift(k[j].clarificationId)
                            } else {
                                b.clarifications[j].isRead = true
                            }
                        } else {
                            b.unreads.unshift(k[j].clarificationId)
                        }
                    } else {
                        if (k[j].isAnswered === false) {
                            b.unreads.unshift(k[j].clarificationId)
                        }
                    }
                }
            }
            a.setUnreads(b.unreads)
        }).error(function(h) {
            console.log("error");
            console.log(h)
        })
    }
    ;
    b.checkIfAllowedToAnswer = function() {
        if (e.getData() !== undefined) {
            var g = {
                contestId: d.contestId
            };
            f.post("/announcement/contest/special/check", g).success(function(h) {
                b.allowedToAnswer = h;
                if (b.allowedToAnswer) {
                    b.loadAllClarificationSpecial()
                } else {
                    b.loadAllClarification()
                }
            }).error(function(h) {
                console.log("error");
                console.log(h)
            })
        }
    }
    ;
    b.loadClarificationById = function(i, h) {
        var g = {
            contestId: d.contestId,
            clarificationId: i
        };
        if (g.clarificationId !== null  && g.clarificationId !== undefined && g.clarificationId !== "") {
            f.post("/announcement/contest/clarification", g).success(function(k) {
                if (k !== null ) {
                    for (var j = 0; j < b.clarifications.length; j++) {
                        if (b.clarifications[j].clarificationId == i) {
                            b.clarifications.splice(j, 1);
                            break
                        }
                    }
                    if (h === true) {
                        b.markAsRead(k)
                    }
                    k.isRead = h;
                    b.clarifications.unshift(k)
                }
            }).error(function(j) {
                console.log("error");
                console.log(j)
            })
        }
    }
    ;
    b.parseDateReadable = function(g) {
        var h = new Date(g);
        return ("0" + h.getDate()).slice(-2) + "-" + b.monthNames[h.getMonth()] + "-" + h.getFullYear() + " " + ("0" + h.getHours()).slice(-2) + ":" + ("0" + h.getMinutes()).slice(-2) + ":" + ("0" + h.getSeconds()).slice(-2)
    }
    ;
    b.submitAnswer = function(g) {
        var h = {
            clarificationId: g.clarificationId,
            clarificationUserId: g.userId,
            contestId: g.contestId,
            answer: g.answer
        };
        if (h.clarificationId !== undefined && h.clarificationUserId !== undefined && h.contestId !== undefined && h.answer !== undefined) {
            b.isWorking = true;
            f.post("/announcement/contest/clarification/update", h).success(function(j) {
                if (j) {
                    b.markAsAnswered(g);
                    b.msg[g.clarificationId] = "Sent";
                    setTimeout(function() {
                        b.msg[g.clarificationId] = ""
                    }, 1000);
                    g.isAnswered = true;
                    g.status = "Answered";
                    var i = b.unreads.indexOf(g.clarificationId);
                    if (i !== -1) {
                        b.skipAdding = true;
                        b.unreads.splice(i, 1);
                        a.setUnreads(b.unreads)
                    }
                } else {
                    alert("Failed to update clarification")
                }
                b.isWorking = false
            }).error(function(i) {
                console.log("error");
                console.log(i);
                b.isWorking = false
            })
        }
    }
    ;
    b.setRead = function(i) {
        if (!i.isRead) {
            b.unreads = a.unreadIds;
            var g = b.clarifications.indexOf(i);
            if (g !== -1) {
                b.clarifications[g].isRead = true
            }
            var h = b.unreads.indexOf(i.clarificationId);
            if (h !== -1) {
                b.skipAdding = true;
                b.unreads.splice(h, 1);
                a.setUnreads(b.unreads)
            }
        }
        if (i.status === "Announcement") {
            var j = c.getCookie("readAnnouncement_" + d.contestId);
            if (j === undefined) {
                j = []
            } else {
                j = JSON.parse(j)
            }
            if (j.indexOf(i.clarificationId) === -1) {
                j.unshift(i.clarificationId)
            }
            c.setCookie("readAnnouncement_" + d.contestId, JSON.stringify(j), b.contestData.endTime - (new Date()).getTime() + 3 * 24 * 60 * 60 * 1000, "")
        }
    }
    ;
    b.markAsRead = function(h) {
        var g = {
            clarificationId: h.clarificationId
        };
        if (!h.isRead) {
            if (h.status !== "Announcement") {
                f.post("/announcement/contest/clarification/mark/read", g).success(function(i) {
                    b.setRead(h)
                }).error(function(i) {
                    console.log("error");
                    console.log(i)
                })
            } else {
                b.setRead(h)
            }
        }
    }
    ;
    b.markAsAnswered = function(h) {
        var g = {
            clarificationId: h.clarificationId,
            contestId: d.contestId
        };
        f.post("/announcement/contest/clarification/mark/answered", g).success(function(i) {
            b.setRead(h)
        }).error(function(i) {
            console.log("error");
            console.log(i)
        })
    }
}
]).controller("ClarificationSocketCtrl", ["$scope", "$location", "$routeParams", "$http", "UserDataSvc", "UnreadSvc", "Helper", function(b, g, d, f, e, a, c) {
    b.unreads = [];
    b.contestData = {};
    b.isFirst = true;
    b.allowedToAnswer = false;
    b.hasCheckedUser = false;
    b.reconnectClarificationSocketTimeout = undefined;
    b.stompClient = undefined;
    b.socket = undefined;
    b.$watch(function() {
        return a.getUnreads()
    }, function() {
        if (b.isFirst) {
            b.isFirst = false
        } else {
            b.unreads = a.getUnreads()
        }
    }, true);
    b.$watch(function() {
        return e.getData()
    }, function() {
        if (e.getData() !== undefined && !b.hasCheckedUser) {
            b.hasCheckedUser = true;
            b.checkIfAllowedToAnswer()
        }
    }, true);
    b.loadContestData = function() {
        f.post("/announcement/contest/view/" + d.contestId).success(function(h) {
            b.contestData = h
        }).error(function(h) {
            console.log("error");
            console.log(h)
        })
    }
    ;
    b.checkIfAllowedToAnswer = function() {
        if (e.getData() !== undefined) {
            var h = {
                contestId: d.contestId
            };
            f.post("/announcement/contest/special/check", h).success(function(i) {
                b.allowedToAnswer = i;
                if (b.allowedToAnswer) {
                    b.loadAllClarificationSpecial()
                } else {
                    b.loadAllClarification()
                }
                b.connect()
            }).error(function(i) {
                console.log("error");
                console.log(i)
            })
        }
    }
    ;
    b.loadAllClarification = function() {
        f.post("/announcement/contest/clarification/list", {
            contestId: d.contestId
        }).success(function(k) {
            b.unreads = [];
            if (k !== null  && k !== "" && k !== undefined) {
                var h = c.getCookie("readAnnouncement_" + d.contestId);
                if (h !== undefined) {
                    h = JSON.parse(h)
                }
                for (var j = 0; j < k.length; j++) {
                    if (k[j].status === "Announcement") {
                        if (h !== undefined) {
                            if (h.indexOf(k[j].clarificationId) === -1) {
                                b.unreads.unshift(k[j].clarificationId)
                            }
                        } else {
                            b.unreads.unshift(k[j].clarificationId)
                        }
                    } else {
                        if (k[j].isRead === false) {
                            b.unreads.unshift(k[j].clarificationId)
                        }
                    }
                }
            }
            a.setUnreads(b.unreads)
        }).error(function(h) {
            console.log("error");
            console.log(h)
        })
    }
    ;
    b.loadAllClarificationSpecial = function() {
        f.post("/announcement/contest/clarification/list/all", {
            contestId: d.contestId
        }).success(function(k) {
            b.unreads = [];
            if (k !== null  && k !== undefined && k !== "") {
                var h = c.getCookie("readAnnouncement_" + d.contestId);
                if (h !== undefined) {
                    h = JSON.parse(h)
                }
                for (var j = 0; j < k.length; j++) {
                    if (k[j].status === "Announcement") {
                        if (h !== undefined) {
                            if (h.indexOf(k[j].clarificationId) === -1) {
                                b.unreads.unshift(k[j].clarificationId)
                            }
                        } else {
                            b.unreads.unshift(k[j].clarificationId)
                        }
                    } else {
                        if (k[j].isAnswered === false) {
                            b.unreads.unshift(k[j].clarificationId)
                        }
                    }
                }
            }
            a.setUnreads(b.unreads)
        }).error(function(h) {
            console.log("error");
            console.log(h)
        })
    }
    ;
    b.$on("$routeChangeStart", function(h, i) {
        if (b.stompClient !== undefined) {
            b.stompClient.disconnect()
        }
        clearTimeout(b.reconnectClarificationSocketTimeout)
    });
    b.connect = function() {
        b.socket = new SockJS((g.host() === "localhost") ? "https://localhost:8443/websocket/general/endpoint" : "https://jollybeeoj.com/websocket/general/endpoint");
        b.stompClient = Stomp.over(b.socket);
        b.stompClient.debug = null ;
        b.stompClient.connect({}, function(j) {
            var i = "";
            var h = "";
            if (b.allowedToAnswer) {
                i = "/websocket/subscribe/announcement/contest/clarification/special/" + d.contestId
            } else {
                if (e.getData() !== undefined) {
                    i = "/websocket/subscribe/announcement/contest/clarification/" + d.contestId + "/" + e.getData().userId;
                    h = "/websocket/subscribe/announcement/contest/clarification/announcement/" + d.contestId
                }
            }
            if (i !== "") {
                b.stompClient.subscribe(i, function(l) {
                    var k = Number(l.body);
                    b.$apply(function() {
                        if (b.unreads.indexOf(k) === -1) {
                            b.unreads.unshift(k);
                            a.setUnreads(b.unreads)
                        }
                    })
                });
                if (h !== "") {
                    b.stompClient.subscribe(h, function(l) {
                        var k = Number(l.body);
                        b.$apply(function() {
                            b.unreads.unshift(k);
                            a.setUnreads(b.unreads)
                        })
                    })
                }
            }
        }, function(h) {
            b.reconnectClarificationSocketTimeout = setTimeout(function() {
                b.connect()
            }, 10000)
        })
    }
}
]);
angular.module("contestModule", ["helperModule"]).filter("contestIsNotAddedIn", function() {
    return function(e, d) {
        var b = d.addedProblemList;
        var a = {};
        for (var c = 0; c < e.length; c++) {
            var f = e[c].problemId;
            if (!b.hasOwnProperty(f)) {
                a[f] = e[c].title
            }
        }
        return a
    }
}).controller("contestCtrl", ["$scope", "$http", "$location", "$interval", "Helper", "ServerTimeSvc", function(b, f, e, d, c, a) {
    b.isWorking = false;
    b.contests = {};
    b.pages = [];
    b.registerMsg = [];
    b.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    b.countDownPromise = undefined;
    b.currTimeSynchronizePromise = undefined;
    b.currTime;
    b.$on("$routeChangeStart", function(h, i) {
        var g = e.path();
        if (g !== "/") {
            b.stopCountDown()
        }
    });
    b.isEmptyObject = function(g) {
        return c.isEmptyObject(g)
    }
    ;
    b.parseDateReadable = function(g) {
        var h = new Date(g);
        return ("0" + h.getDate()).slice(-2) + "-" + b.monthNames[h.getMonth()] + "-" + h.getFullYear() + " " + ("0" + h.getHours()).slice(-2) + ":" + ("0" + h.getMinutes()).slice(-2) + ":" + ("0" + h.getSeconds()).slice(-2)
    }
    ;
    b.loadUpcomingContest = function() {
        f.post("/announcement/contest/view/current").success(function(g) {
            b.contests = g
        }).error(function(g) {
            console.log("error");
            console.log(g)
        })
    }
    ;
    b.loadAllContests = function() {
        f.post("/announcement/tools/data/contest").success(function(h) {
            b.contests = h;
            for (var g = 0; g < b.contests.length; g++) {
                b.contests[g].hasFinished = b.currTime > b.contests[g].endTime
            }
        }).error(function(g) {
            console.log("errror");
            console.log(g)
        })
    }
    ;
    b.getDuration = function(h, g) {
        var j = Math.abs(g - h);
        var i = new Date(j);
        i = new Date(i.getTime() + i.getTimezoneOffset() * 60000);
        return (Math.floor(j / 3600000)) + " h(s) " + ("0" + i.getMinutes()).slice(-2) + " min(s)"
    }
    ;
    b.contestAboutPath = function(g) {
        return "/user/contest/" + g + "/about"
    }
    ;
    b.registerContest = function(h) {
        var g = new FormData();
        g.append("contestId", h);
        $.ajax({
            type: "POST",
            url: "/user/contest/register",
            data: g,
            contentType: false,
            processData: false,
            cache: false,
            success: function(i) {
                b.$apply(function() {
                    alert(i);
                    b.isWorking = false;
                    b.loadAllContests()
                })
            },
            error: function(i) {
                b.isWorking = false;
                console.log("error");
                console.log(i)
            }
        })
    }
    ;
    b.getCurrentGlobalTimestamp = function(g) {
        b.currTime = a.currentServerTime();
        if (b.currTime === undefined || b.currTime === NaN) {
            setTimeout(function() {
                b.getCurrentGlobalTimestamp(g)
            }, 10000)
        } else {
            if (g) {
                g()
            }
        }
    }
    ;
    b.updateCountDown = function() {
        if (!b.isEmptyObject(b.contests)) {
            b.currTime += 1000;
            if (b.contests[0].startTime > b.currTime) {
                b.cdMsg = "before " + b.contests[0].title;
                b.targetTime = b.contests[0].startTime
            } else {
                if (b.contests[0].endTime >= b.currTime) {
                    b.cdMsg = "time remaining on " + b.contests[0].title;
                    b.targetTime = b.contests[0].endTime
                } else {
                    if (b.contests[0].endTime < b.currTime) {
                        b.cdMsg = b.contests[0].title + " has finished";
                        b.targetTime = undefined;
                        b.contests.shift()
                    }
                }
            }
            if (b.targetTime !== undefined) {
                var g = Math.abs(b.currTime - b.targetTime);
                var h = new Date(g);
                h = new Date(h.getTime() + h.getTimezoneOffset() * 60000);
                b.countDownTime = (Math.floor(g / 3600000)) + " : " + ("0" + h.getMinutes()).slice(-2) + " : " + ("0" + h.getSeconds()).slice(-2)
            }
        } else {
            b.cdMsg = "No upcoming contests"
        }
    }
    ;
    b.synchronizeCurrentTime = function() {
        b.getCurrentGlobalTimestamp();
        b.currTimeSynchronizePromise = d(b.getCurrentGlobalTimestamp, 600000)
    }
    ;
    b.startCountDown = function(g) {
        b.countDownPromise = d(b.updateCountDown, 1000)
    }
    ;
    b.stopCountDown = function() {
        d.cancel(b.countDownPromise);
        d.cancel(b.currTimeSynchronizePromise)
    }
}
]).controller("contestToolsCtrl", ["$scope", "$http", "Helper", function(a, c, b) {
    a.isWorking = false;
    a.contests = {};
    a.addedProblemList = {};
    a.problemList = [];
    a.contestData = undefined;
    a.allLanguages = [];
    a.languages = [];
    a.grantedUsers = [];
    a.dummyUsers = [];
    a.contestProblems = [];
    a.autocomplete = {};
    a.startDateData = {
        day: 31,
        month: 12,
        year: 2015,
        hour: 23,
        minute: 59,
        second: 59
    };
    a.endDateData = {
        day: 31,
        month: 12,
        year: 2015,
        hour: 23,
        minute: 59,
        second: 59
    };
    a.triggerUpdateRating = function() {
        var e = a.contestData.contestId;
        var f = a.contestData.title;
        if (confirm("Are you sure you want to update rating for contest " + e + " - " + f + " ? This action can't be undone")) {
            a.isWorking = true;
            var d = new FormData();
            d.append("contestId", e);
            $.ajax({
                type: "POST",
                url: "/announcement/tools/contest/trigger/rating",
                data: d,
                contentType: false,
                processData: false,
                cache: false,
                success: function(g) {
                    a.$apply(function() {
                        a.msg = g;
                        a.isWorking = false
                    })
                },
                error: function(g) {
                    console.log("data")
                }
            })
        }
    }
    ;
    a.triggerAddContestProblemToArchive = function() {
        var e = a.contestData.contestId;
        var f = a.contestData.title;
        if (confirm("Are you sure you want to add contest problems in " + e + " - " + f + " to archive? This action can't be undone")) {
            a.isWorking = true;
            var d = new FormData();
            d.append("contestId", e);
            $.ajax({
                type: "POST",
                url: "/problem/tools/contest/trigger/copyToArchive",
                data: d,
                contentType: false,
                processData: false,
                cache: false,
                success: function(g) {
                    a.$apply(function() {
                        a.msg = g;
                        a.isWorking = false
                    })
                },
                error: function(g) {
                    console.log("data")
                }
            })
        }
    }
    ;
    $("#dummyUserInput").keyup(function(d) {
        if (d.keyCode === 13 && a.autocomplete.dummyUser !== "") {
            a.$apply(function() {
                if ($.inArray(a.autocomplete.dummyUser, a.dummyUsers) === -1) {
                    a.dummyUsers.push(a.autocomplete.dummyUser)
                }
                a.autocomplete.dummyUser = ""
            })
        }
    });
    $("#grantedUserInput").keyup(function(d) {
        if (d.keyCode === 13 && a.autocomplete.grantedUser !== "") {
            a.$apply(function() {
                if ($.inArray(a.autocomplete.grantedUser, a.grantedUsers) === -1) {
                    a.grantedUsers.push(a.autocomplete.grantedUser)
                }
                a.autocomplete.grantedUser = ""
            })
        }
    });
    a.getAutocompleteUsername = function(d) {
        return c.post("/user/autocomplete", {
            pattern: d
        }).then(function(e) {
            return e.data
        })
    }
    ;
    a.loadHiddenProblems = function() {
        c.post("problem/view/hidden").success(function(d) {
            a.problemList = d
        }).error(function(d) {
            console.log("error");
            console.log(d)
        })
    }
    ;
    a.loadAllContests = function() {
        c.post("/announcement/tools/data/contest").success(function(d) {
            a.contests = d
        }).error(function(d) {
            console.log("errror");
            console.log(d)
        })
    }
    ;
    a.loadAddedProblem = function() {
        c.post("/problem/tools/data/problem_contest", {
            contestId: a.contestData.contestId
        }).success(function(e) {
            for (var d = 0; d < e.length; d++) {
                a.addedProblemList[e[d].problemId] = e[d].title
            }
        }).error(function(d) {
            console.log("errror");
            console.log(d)
        })
    }
    ;
    a.moveProblemToAddedList = function(e, d) {
        a.addedProblemList[e] = d
    }
    ;
    a.deleteProblemFromAddedList = function(d) {
        delete a.addedProblemList[d]
    }
    ;
    a.getLanguages = function() {
        c.post("/submission/view/language").success(function(d) {
            a.allLanguages = d
        }).error(function(d) {
            console.log("error:" + d)
        })
    }
    ;
    a.loadContestLanguage = function() {
        c.post("/submission/view/language/" + a.contestData.contestId).success(function(d) {
            a.contestData.languages = d
        }).error(function(d) {
            console.log("error");
            console.log(d)
        })
    }
    ;
    a.loadAuthorizedContests = function() {
        c.post("/announcement/tools/contest/user/special_privilege").success(function(d) {
            a.contests = d
        }).error(function(d) {
            console.log("error");
            console.log(d)
        })
    }
    ;
    a.processData = function() {
        c.post("/announcement/contest/view/" + a.contestData.contestId).success(function(d) {
            a.contestData = d;
            a.parseDateTo(a.contestData.startTime, a.startDateData);
            a.parseDateTo(a.contestData.endTime, a.endDateData)
        }).error(function(d) {
            console.log(d)
        });
        a.loadContestLanguage();
        a.loadGrantedUser();
        a.loadDummyUser()
    }
    ;
    a.parseDateTo = function(e, f) {
        var g = new Date(e);
        f.day = g.getDate();
        f.month = g.getMonth() + 1;
        f.year = g.getFullYear();
        f.hour = g.getHours();
        f.minute = g.getMinutes();
        f.second = g.getSeconds()
    }
    ;
    a.addContest = function() {
        a.isWorking = true;
        a.contestData.startTimeLong = (new Date(a.startDateData.year,a.startDateData.month - 1,a.startDateData.day,a.startDateData.hour,a.startDateData.minute,a.startDateData.second)).getTime();
        a.contestData.endTimeLong = (new Date(a.endDateData.year,a.endDateData.month - 1,a.endDateData.day,a.endDateData.hour,a.endDateData.minute,a.endDateData.second)).getTime();
        if (!a.contestData.openRegistration) {
            a.contestData.openRegistration = false
        }
        if (!a.contestData.allowSubmissionAfterAccepted) {
            a.contestData.allowSubmissionAfterAccepted = false
        }
        if (!a.contestData.revealFullScoreboard) {
            a.contestData.revealFullScoreboard = false
        }
        if (!a.contestData.revealProblemToPublic) {
            a.contestData.revealProblemToPublic = false
        }
        var d = new FormData();
        angular.forEach(a.contestData, function(f, e) {
            this.append(e, f)
        }, d);
        d.append("specialPrivilegeUsername", a.grantedUsers);
        d.append("dummyUsername", a.dummyUsers);
        $.ajax({
            type: "POST",
            url: "/announcement/tools/contest/add",
            data: d,
            contentType: false,
            processData: false,
            cache: false,
            success: function(e) {
                a.$apply(function() {
                    a.msg = e
                })
            },
            error: function(e) {
                console.log("error");
                console.log(e)
            },
            completed: function() {
                a.$apply(function() {
                    a.isWorking = false
                })
            }
        })
    }
    ;
    a.updateContest = function() {
        a.isWorking = true;
        a.contestData.startTimeLong = (new Date(a.startDateData.year,a.startDateData.month - 1,a.startDateData.day,a.startDateData.hour,a.startDateData.minute,a.startDateData.second)).getTime();
        a.contestData.endTimeLong = (new Date(a.endDateData.year,a.endDateData.month - 1,a.endDateData.day,a.endDateData.hour,a.endDateData.minute,a.endDateData.second)).getTime();
        var e = new FormData();
        angular.forEach(a.contestData, function(h, g) {
            this.append(g, h)
        }, e);
        var f = [];
        for (var d = 0; d < a.contestData.languages.length; d++) {
            f.push(a.contestData.languages[d])
        }
        e.append("allowedLanguage", f);
        e.append("specialPrivilegeUsername", a.grantedUsers);
        e.append("dummyUsername", a.dummyUsers);
        $.ajax({
            type: "POST",
            url: "/announcement/tools/contest/update",
            data: e,
            contentType: false,
            processData: false,
            cache: false,
            success: function(g) {
                a.$apply(function() {
                    a.msg = g;
                    a.isWorking = false
                })
            },
            error: function(g) {
                a.isWorking = false;
                console.log("error");
                console.log(g)
            }
        })
    }
    ;
    a.deleteLanguage = function(d) {
        a.contestData.languages.splice(d, 1)
    }
    ;
    a.loadGrantedUser = function(d) {
        c.post("/announcement/tools/contest/special_privilege", {
            contestId: a.contestData.contestId
        }).success(function(f) {
            a.grantedUsers = [];
            for (var e = 0; e < f.length; e++) {
                a.grantedUsers.push(f[e].username)
            }
        }).error(function(e) {
            console.log("error");
            console.log(e)
        })
    }
    ;
    a.loadDummyUser = function() {
        c.post("/announcement/tools/contest/dummy_user", {
            contestId: a.contestData.contestId
        }).success(function(e) {
            a.dummyUsers = [];
            for (var d = 0; d < e.length; d++) {
                a.dummyUsers.push(e[d].username)
            }
        }).error(function(d) {
            console.log("error");
            console.log(d)
        })
    }
    ;
    a.deleteGrantedUser = function(d) {
        a.grantedUsers.splice(d, 1)
    }
    ;
    a.deleteDummyUser = function(d) {
        a.dummyUsers.splice(d, 1)
    }
    ;
    $("#inputLanguage").keyup(function(e) {
        if (e.keyCode === 13 && $("#inputLanguage").val() !== "") {
            var f = $("#inputLanguage").val();
            $("#inputLanguage").val("");
            var d = $.grep(a.contestData.languages, function(h, g) {
                return h === f
            });
            if (d.length === 0) {
                a.$apply(function() {
                    a.contestData.languages.push(f)
                })
            }
        }
    })
}
]).controller("contestDetailCtrl", ["$scope", "$http", "$routeParams", "$sce", "$location", "$interval", "Helper", "$anchorScroll", "UserDataSvc", "ServerTimeSvc", function(j, g, i, h, b, e, c, d, a, f) {
    j.addHoverCard_username = addHoverCard_username;
    j.removeHoverCard = removeHoverCard;
    j.sterilizeUsername = c.sterilizeUsername;
    j.isWorking = false;
    j.targetTime = undefined;
    j.countDownTime = "--:--:--";
    j.cdMsg = "-";
    j.countDownPromise = undefined;
    j.currTimeSynchronizePromise = undefined;
    j.contestData = {};
    j.contestProblems = {};
    j.contestProblemPath = {};
    j.contestRating = {};
    j.contestRatingHighlightUser = {};
    j.rating = {};
    j.editorial = {};
    j.scoreboardData = {};
    j.scoreboardZeroPointRank = 0;
    j.scoreboardLastUpdateTime = -1;
    j.currentPage = "";
    j.languages = [];
    j.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    j.currTime = undefined;
    j.scoreboardShowDummy = false;
    j.scoreboardShowFull = false;
    j.userStatusInContest = "";
    j.allowRevealFullScoreboard = false;
    j.allowRevealEditorial = false;
    j.flag_runner_tool = false;
    j.flaggedCell = {};
    j.updateContestScoreboardTimeout = null ;
    j.$on("$routeChangeStart", function(l, m) {
        var k = b.path();
        if (k !== "/user/contest/" + i.contestId) {
            j.stopCountDown()
        }
        clearTimeout(j.updateContestScoreboardTimeout)
    });
    j.parseToHTML = function(k) {
        return c.parseToHTML(h, k)
    }
    ;
    j.$watch(function() {
        return a.getData()
    }, function() {
        j.userDataShared = a.getData()
    });
    j.loadRatingData = function() {
        g.post("/announcement/contest/rating", {
            contestId: i.contestId
        }).success(function(k) {
            j.contestRating = k;
            if (i.user !== undefined) {
                j.contestRatingHighlightUser = i.user;
                b.hash("anchor" + j.contestRatingHighlightUser);
                d.yOffset = 100;
                setTimeout(function() {
                    d()
                }, 1000)
            }
        }).error(function(k) {
            console.log(k)
        })
    }
    ;
    j.rating.shareToFacebook = function(r) {
        var n, m;
        var q;
        var l;
        for (var k = 0; k < j.contestRating.length; k++) {
            if (j.contestRating[k].username === r) {
                var p = j.contestRating[k];
                q = p.changes;
                if (q > 0) {
                    q = "+" + q
                }
                n = p.oldRatingTitle;
                m = p.newRatingTitle;
                l = p.userId;
                break
            }
        }
        var o;
        if (n === m) {
            o = "I just got " + q + " rating from " + j.contestData.title + ". Check it out here!"
        } else {
            o = "I just got promoted from " + n + " to " + m + " from " + j.contestData.title + ". Check it out here!"
        }
        FB.ui({
            method: "feed",
            name: "Jollybee Online Judge - Rating Changes",
            caption: "Changes in " + r + "'s rating",
            description: o,
            link: "https://jollybeeoj.com/user/contest/" + j.contestData.contestId + "/rating?user=" + r,
            message: "",
            picture: "jollybeeoj.com/images/logo-med.png"
        }, function(s) {})
    }
    ;
    j.loadFlagData = function() {
        var k = c.getCookie("flaggedCell_" + i.contestId);
        if (k === undefined || k === null  || k === "") {
            j.flaggedCell = {}
        } else {
            j.flaggedCell = JSON.parse(k)
        }
    }
    ;
    j.switchFlagData = function(k, l) {
        if (!j.flaggedCell.hasOwnProperty(k)) {
            j.flaggedCell[k] = false
        }
        j.flaggedCell[k] = !j.flaggedCell[k];
        console.log(j.flaggedCell);
        c.setCookie("flaggedCell_" + i.contestId, JSON.stringify(j.flaggedCell), j.contestData.endTime - (new Date()).getTime() + 3 * 24 * 60 * 60 * 1000, "");
        if (j.flaggedCell[k]) {
            $(l).css("color", "rgba(0,0,0,0.4)")
        } else {
            $(l).css("color", "")
        }
    }
    ;
    j.loadContestProblem = function(l, k) {
        g.post("/problem/contest/" + i.contestId).success(function(n) {
            j.contestProblems = n;
            if (j.contestProblems !== "" && j.contestProblems !== null  && j.contestProblems !== undefined) {
                j.contestProblems.sort(function m(p, o) {
                    if (p.problemCode < o.problemCode) {
                        return -1
                    }
                    if (p.problemCode > o.problemCode) {
                        return 1
                    }
                    return 0
                })
            }
            if (l) {
                l(k)
            }
        }).error(function(m) {
            console.log("error");
            console.log(m)
        })
    }
    ;
    j.editorial.load = function(l) {
        var k = new FormData();
        k.append("contestId", i.contestId);
        k.append("contestProblemId", l);
        $.ajax({
            url: "/announcement/contest/view/editorial",
            method: "POST",
            data: k,
            contentType: false,
            processData: false,
            cache: false,
            success: function(m) {
                j.$apply(function() {
                    if (m === "") {
                        m = "There is no editorial for this problem"
                    }
                    j.editorial.html = m;
                    j.editorial.showingId = l
                })
            },
            error: function(m) {
                console.log("error: " + m)
            }
        })
    }
    ;
    j.checkRevealEditorial = function() {
        g.post("/announcement/contest/editorial/public/check/" + i.contestId).success(function(k) {
            j.allowRevealEditorial = k
        }).error(function(k) {
            console.log("error: " + k)
        })
    }
    ;
    j.loadContestData = function(k) {
        if (c.isEmptyObject(j.contestData) === false) {
            if (k) {
                k()
            }
            return
        }
        g.post("/announcement/contest/view/" + i.contestId).success(function(m) {
            j.contestData = m;
            $("head > title").remove();
            var l;
            if (b.path().indexOf("/about") !== -1) {
                l = "About"
            } else {
                if (b.path().indexOf("/problem") !== -1) {
                    l = "Problem"
                } else {
                    if (b.path().indexOf("/textsubmission") !== -1) {
                        l = "Submit"
                    } else {
                        if (b.path().indexOf("/judgestatus") !== -1) {
                            l = "Judge Status"
                        } else {
                            if (b.path().indexOf("/clarification") !== -1) {
                                l = "Clarification"
                            } else {
                                if (b.path().indexOf("/scoreboard") !== -1) {
                                    l = "Scoreboard"
                                } else {
                                    if (b.path().indexOf("/rating") !== -1) {
                                        l = "Rating Changes"
                                    } else {
                                        if (b.path().indexOf("/editorial") !== -1) {
                                            l = "Editorial"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            $("head").append("<title>Contest - " + j.contestData.title + ((l !== "" && l !== undefined && l !== null ) ? (" - " + l) : ("")) + "</title>");
            j.loadContestLanguage();
            if (k) {
                k()
            }
        }).error(function(l) {
            console.log("error");
            console.log(l)
        })
    }
    ;
    j.loadContestLanguage = function() {
        g.post("/submission/view/language/" + i.contestId).success(function(k) {
            j.contestData.languages = k
        }).error(function(k) {
            console.log("error");
            console.log(k)
        })
    }
    ;
    j.refreshContestProblemPath = function() {
        for (var l in j.contestProblems) {
            var m = j.contestProblems[l].problemId;
            if (j.allowRevealProblemToPublic === true) {
                j.contestProblemPath[m] = "/user/contest/" + i.contestId + "/problem/" + m;
                continue
            }
            if (j.userStatusInContest !== "Dummy User" && j.userStatusInContest !== "Special Privileged User" && j.userStatusInContest !== "Contestant") {
                break
            }
            j.contestProblemPath[m] = "/user/contest/" + i.contestId + "/problem/" + m
        }
    }
    ;
    j.loadScoreboardData = function() {
        j.flag_runner_tool = (i.flag !== undefined);
        if (j.flag_runner_tool) {
            j.loadFlagData()
        }
        g.post("/problem/contest/" + i.contestId).success(function(l) {
            j.contestProblems = l;
            if (j.contestProblems !== null  && j.contestProblems !== undefined && j.contestProblems !== "") {
                j.contestProblems.sort(function k(n, m) {
                    if (n.problemCode < m.problemCode) {
                        return -1
                    }
                    if (n.problemCode > m.problemCode) {
                        return 1
                    }
                    return 0
                })
            }
            j.refreshContestProblemPath();
            j.loadScoreboard()
        }).error(function(k) {
            console.log("error");
            console.log(k)
        })
    }
    ;
    j.checkUserStatusInContest = function() {
        var k = new FormData();
        k.append("contestId", i.contestId);
        $.ajax({
            type: "POST",
            url: "/announcement/contest/user_status/check",
            data: k,
            contentType: false,
            processData: false,
            cache: false,
            success: function(l) {
                j.$apply(function() {
                    j.userStatusInContest = l;
                    j.refreshContestProblemPath()
                })
            },
            error: function(l) {
                console.log("error : " + l)
            }
        })
    }
    ;
    j.registerContest = function() {
        j.isWorking = true;
        var k = new FormData();
        k.append("contestId", i.contestId);
        $.ajax({
            type: "POST",
            url: "/user/contest/register",
            data: k,
            contentType: false,
            processData: false,
            cache: false,
            success: function(l) {
                j.$apply(function() {
                    alert(l);
                    j.isWorking = false;
                    j.checkUserStatusInContest()
                })
            },
            error: function(l) {
                j.isWorking = false;
                console.log("error");
                console.log(l)
            }
        })
    }
    ;
    j.checkAllowRevealFullScoreboard = function() {
        g.post("/announcement/contest/scoreboard/full/check/" + i.contestId).success(function(k) {
            if (k === true || k === false) {
                j.allowRevealFullScoreboard = k
            }
            j.refreshContestProblemPath()
        }).error(function(k) {
            console.log("error " + k)
        })
    }
    ;
    j.loadScoreboard = function() {
        if (b.url().indexOf("scoreboard") === -1) {
            return
        }
        j.loadContestData(function() {
            g.post("/announcement/contest/view/scoreboard/" + i.contestId, {
                showDummy: j.scoreboardShowDummy,
                showFull: j.scoreboardShowFull,
                time: j.scoreboardLastUpdateTime
            }).success(function(q) {
                if (q === null  || q === "null" || q === undefined || q === "undefined" || q === "") {
                    clearTimeout(j.updateContestScoreboardTimeout);
                    j.updateContestScoreboardTimeout = setTimeout(function() {
                        j.loadScoreboard()
                    }, 20000);
                    return
                }
                j.scoreboardData = q.value;
                j.scoreboardLastUpdateTime = q.key;
                var k = false;
                for (var r = 0; r < j.contestProblems.length; r++) {
                    var n = -1;
                    var t = -1;
                    var s = j.contestProblems[r].problemId;
                    if (!k) {
                        j.scoreboardZeroPointRank = 0
                    }
                    for (var o = 0; o < j.scoreboardData.length; o++) {
                        if (j.scoreboardData[o].acceptedTime.hasOwnProperty(s)) {
                            if (j.scoreboardData[o].acceptedTime[s] !== null ) {
                                if (j.scoreboardData[o].acceptedTime[s] < n || n === -1) {
                                    n = j.scoreboardData[o].acceptedTime[s];
                                    if (t !== -1) {
                                        j.scoreboardData[t].cell[s].firstAc = false
                                    }
                                    t = o;
                                    j.scoreboardData[o].cell[s].firstAc = true
                                }
                            }
                        }
                        if (!k) {
                            var v = j.scoreboardData[o].username.indexOf("]");
                            if (v !== -1) {
                                j.scoreboardData[o].username = j.scoreboardData[o].username.substr(v + 1)
                            }
                            if (j.scoreboardData[o].score !== 0) {
                                j.scoreboardZeroPointRank = o + 1
                            }
                        }
                    }
                    if (!k) {
                        j.scoreboardZeroPointRank++
                    }
                    k = true
                }
                if (!k) {
                    j.scoreboardZeroPointRank = 0;
                    for (var r = 0; r < j.scoreboardData.length; r++) {
                        var v = j.scoreboardData[r].username.indexOf("]");
                        if (v !== -1) {
                            j.scoreboardData[r].username = j.scoreboardData[r].username.substr(v + 1)
                        }
                        if (j.scoreboardData[r].score !== 0) {
                            j.scoreboardZeroPointRank = r + 1
                        }
                    }
                    j.scoreboardZeroPointRank++
                }
                var m = "";
                m += "<thead><tr class='table table-hover' id='dataTable'>";
                m += "<td class='tableHeader anim:position'>Rank</td>";
                m += "<td class='tableHeader anim:id'>Name</td>";
                m += "<td class='tableHeader'>Solved</td>";
                m += "<td class='tableHeader'>Time Penalty</td>";
                for (var r = 0; r < j.contestProblems.length; r++) {
                    var x = j.contestProblemPath[j.contestProblems[r].problemId];
                    m += "<td class='tableHeader'><a class='problemScoreboardLink' " + ((x === undefined || x === "undefined" || x === null  || x === "null" || x === "") ? ("") : (" href='" + x + "' ")) + " data-toggle='tooltip' data-placement='top' data-original-title='" + j.contestProblems[r].title + "'>" + j.contestProblems[r].problemCode + "</a></td>"
                }
                m += "</tr></thead><tbody>";
                for (var r = 0; r < j.scoreboardData.length; r++) {
                    m += "<tr>";
                    var q = j.scoreboardData[r];
                    if (q.score > 0) {
                        m += "<td><center><span class='scoreboardCellWrapper'>" + (r + 1) + "</span></center></td>"
                    } else {
                        m += "<td><center><span class='scoreboardCellWrapper'>" + j.scoreboardZeroPointRank + "</span></center></td>"
                    }
                    m += "<td style='text-align:left'><span class='scoreboardCellWrapper' style='padding-left:8px; padding-right:8px;'><a onmouseover='addHoverCard_username(this, \"" + q.username + "\")' onmouseleave='removeHoverCard()' href='/user/view/" + q.username + "' target='_blank' class='username' style='color:" + q.ratingColor + "'>" + q.username + "</a>" + ((q.description !== "") ? ("<span class='scoreboardUserDescription'><br>" + q.description + "</span>") : ("")) + "</span></td>";
                    m += "<td><center><span class='scoreboardCellWrapper'>" + q.score + "</span></center></td>";
                    m += "<td><center><span class='scoreboardCellWrapper'>" + q.penalty + "</span></center></td>";
                    for (var o = 0; o < j.contestProblems.length; o++) {
                        var l = j.contestProblems[o];
                        var u = q.cell[l.problemId];
                        m += "<td class='scoreboardCellData' style='min-width:50px;'><center style='display:table; width:100%;'><span class='scoreboardCellWrapper' style='" + ((u === undefined) ? ("background-color:white;") : ((u.accepted) ? ("background-color:#80FF80;") : ("background-color:#FF8080"))) + "'>";
                        if (q.cell[l.problemId] !== undefined) {
                            m += "<p style='margin:0px; text-align: center;'>";
                            m += u.totalAttempt;
                            if (u.firstAc) {
                                m += " <span class='glyphicon glyphicon-king' style='color:chocolate; font-weight:bold;'></span>"
                            }
                            m += "<br/>";
                            if (u.accepted) {
                                m += "<small>" + j.getDiffAccTime(q.acceptedTime[l.problemId]) + "</small>"
                            }
                            if (j.flag_runner_tool && u.accepted) {
                                var w = q.username + "-" + l.problemId;
                                m += '<span class="scoreboardFlag" onclick=\'angular.element(this).scope().switchFlagData("' + w + "\", this);'><span id='" + w + "' class='glyphicon glyphicon-flag' style='vertical-align:middle; " + ((j.flaggedCell[w]) ? ("color: rgba(0,0,0,0.4);") : ("")) + "'></span></center>"
                            }
                        }
                        m += "</span></center></td>"
                    }
                    m += "</tr>"
                }
                m += "</tbody>";
                m = "<table id='hiddenTableScoreData' class='table' style='white-space:nowrap; display: none;'>" + m + "</table>";
                if ($("#tableScoreData").html() !== "") {
                    $("#scoreboardContainer").append(m);
                    $("#tableScoreData").rankingTableUpdate("#hiddenTableScoreData", {
                        duration: [750, 100, 750, 100, 750],
                        animationSettings: {
                            up: {
                                left: 0,
                                backgroundColor: "#CCFFCC"
                            },
                            down: {
                                left: 0,
                                backgroundColor: "#FFCCCC"
                            },
                            fresh: {
                                left: 0,
                                backgroundColor: "#CCFFCC"
                            },
                            drop: {
                                left: 0,
                                backgroundColor: "#FFCCCC"
                            }
                        }
                    });
                    $("#hiddenTableScoreData").attr("id", "tableScoreData")
                } else {
                    $("#tableScoreData").html(m)
                }
                clearTimeout(j.updateContestScoreboardTimeout);
                j.updateContestScoreboardTimeout = setTimeout(function() {
                    j.loadScoreboard()
                }, 20000)
            }).error(function(k) {
                console.log("error");
                console.log(k)
            })
        })
    }
    ;
    j.toggleScoreboardShowFull = function() {
        j.scoreboardShowFull = !j.scoreboardShowFull;
        j.scoreboardLastUpdateTime = -1;
        j.loadScoreboard()
    }
    ;
    j.toggleScoreboardShowDummy = function() {
        j.scoreboardShowDummy = !j.scoreboardShowDummy;
        j.scoreboardLastUpdateTime = -1;
        j.loadScoreboard()
    }
    ;
    j.getDiffAccTime = function(l) {
        var m = (l - j.contestData.startTime) / 1000;
        var k = Math.floor(m / 3600);
        var n = Math.floor((m % 3600) / 60);
        if (k < 10) {
            k = "0" + k
        } else {
            k = "" + k
        }
        if (n < 10) {
            n = "0" + n
        } else {
            n = "" + n
        }
        return k + ":" + n
    }
    ;
    j.parseDateReadable = function(k) {
        if (k) {
            var l = new Date(k);
            return ("0" + l.getDate()).slice(-2) + "-" + j.monthNames[l.getMonth()] + "-" + l.getFullYear() + " " + ("0" + l.getHours()).slice(-2) + ":" + ("0" + l.getMinutes()).slice(-2) + ":" + ("0" + l.getSeconds()).slice(-2)
        }
    }
    ;
    j.getCurrentGlobalTimestamp = function() {
        j.currTime = f.currentServerTime();
        if (j.currTime === undefined || j.currTime === NaN) {
            setTimeout(function() {
                j.getCurrentGlobalTimestamp()
            }, 10000)
        }
    }
    ;
    j.updateCountDown = function() {
        j.currTime += 1000;
        if (j.contestData.startTime > j.currTime) {
            j.cdMsg = "before start";
            j.targetTime = j.contestData.startTime
        } else {
            if (j.contestData.endTime >= j.currTime) {
                j.cdMsg = "time remaining";
                j.targetTime = j.contestData.endTime
            } else {
                if (j.contestData.endTime < j.currTime) {
                    j.countDownTime = "--:--:--";
                    j.cdMsg = "Contest has finished";
                    j.targetTime = undefined;
                    j.stopCountDown()
                }
            }
        }
        if (j.targetTime !== undefined) {
            var k = Math.abs(j.currTime - j.targetTime);
            var l = new Date(k);
            l = new Date(l.getTime() + l.getTimezoneOffset() * 60000);
            j.countDownTime = (Math.floor(k / 3600000)) + " : " + ("0" + l.getMinutes()).slice(-2) + " : " + ("0" + l.getSeconds()).slice(-2)
        }
    }
    ;
    j.synchronizeCurrentTime = function() {
        j.getCurrentGlobalTimestamp();
        j.currTimeSynchronizePromise = e(j.getCurrentGlobalTimestamp, 600000)
    }
    ;
    j.startCountDown = function(k) {
        j.countDownPromise = e(j.updateCountDown, 1000)
    }
    ;
    j.stopCountDown = function() {
        e.cancel(j.countDownPromise);
        e.cancel(j.currTimeSynchronizePromise)
    }
}
]);
angular.module("helperModule", []).service("Helper", Helper);
function Helper() {
    this.getVerdictDescription = getVerdictDescription;
    this.getVerdictColor = getVerdictColor;
    this.toCamelCase = toCamelCase;
    this.getPageArr = getPageArr;
    this.parseToHTML = parseToHTML;
    this.setCookie = setCookie;
    this.getCookie = getCookie;
    this.deleteCookie = deleteCookie;
    this.isEmptyObject = isEmptyObject;
    this.generateRandomString = generateRandomString;
    this.getBrowseProblemByContestStructure = getBrowseProblemByContestStructure;
    this.sterilizeUsername = sterilizeUsername;
    this.colorList = colorList
}
function colorList() {
    return ["#F44336", "#9C27B0", "#3f51B5", "2196F3", "#00BCD4", "#009688", "#4CAF50", "#CDDC39", "#FFC107", "#FF9800", "#795548", "#9E9E9E", "#607D8B"]
}
function sterilizeUsername(b) {
    var a = b.indexOf("]");
    if (a !== -1) {
        b = b.substr(a + 1)
    }
    return b
}
function getVerdictColor(a) {
    switch (a) {
    case "Pending":
    case "Output Limit Exceeded":
    case "Submission Error":
        return "#000000";
    case "Accepted":
        return "#00C703";
    case "Time Limit Exceeded":
        return "#001BEB";
    case "Wrong Answer":
        return "#FF0000";
    case "Compile Error":
        return "#FFC400";
    case "Memory Limit Exceeded":
        return "#9900FF";
    case "Run Time Error":
        return "#949400";
    default:
        return "#000000";
    }
}
function getVerdictDescription(a) {
    switch (a) {
    case "Pending":
        return "Your submission is still in judge queue, please be patient.";
    case "Accepted":
        return "Your program is correct. Congratulations!";
    case "Output Limit Exceeded":
        return "Your program produced too much output.";
    case "Time Limit Exceeded":
        return "Your program runs longer than the specified time limit.";
    case "Wrong Answer":
        return "Your program produced incorrect output.";
    case "Compile Error":
        return "Your program can't be compiled by our compiler. You can see the compile error message in your submission detail (click on the id of your submission, it is the most left column of this row).";
    case "Memory Limit Exceeded":
        return "Your program tried to use more memory than the specified memory limit.";
    case "Run Time Error":
        return "Your program crashed during execution (e.g. segmentation fault, floating point exception, etc.)";
    case "Submission Error":
        return "There is something wrong in the server, please contact the administrator, your submission will be rejudged later.";
    default:
        return ""
    }
}
function getBrowseProblemByContestStructure() {
    return {}
}
function generateRandomString(c, b) {
    var a = "";
    for (var d = 0; d < b; d++) {
        a += c[Math.floor(Math.random() * c.length)]
    }
    return a
}
function toCamelCase(b) {
    b = b.replace(b.charAt(0), b.charAt(0).toUpperCase());
    for (var a = 1; a < b.length; a++) {
        if (b.charAt(a) !== " ") {
            if (b.charAt(a) === b.charAt(a).toUpperCase()) {
                b = b.substring(0, a) + " " + b.substring(a);
                a++
            } else {
                if (b.charAt(a) === "_") {
                    b.replace(b.charAt(a), " ");
                    b.replace(b.charAt(a + 1), b.charAt(a + 1).toUpperCase());
                    a += 2
                }
            }
        }
    }
    return b
}
function getPageArr(a, d, f) {
    var b = [];
    var g = false;
    var e = 7;
    if (!isNaN(f)) {
        e = f
    }
    for (var c = 1; c <= d; c++) {
        if (Math.abs(c - a) <= e || c == 1 || c == d || (c == 2 && Math.abs(c - a) <= e + 1) || (c == d - 1 && Math.abs(c - a) <= e + 1)) {
            b.push({
                "class": (c == a) ? "active" : "",
                pageNo: c
            });
            g = false
        } else {
            if (g == false) {
                b.push({
                    "class": "",
                    pageNo: "..."
                });
                g = true
            }
        }
    }
    return b
}
function parseToHTML(b, a) {
    return b.trustAsHtml(a)
}
function setCookie(c, f, b, g) {
    var e = c + "=" + f + ";";
    if (b !== undefined) {
        var h = new Date();
        h.setTime(h.getTime() + b);
        var a = "expires=" + h.toUTCString() + ";";
        e += " " + a
    }
    if (g !== undefined) {
        e += " path=/" + g + ";"
    } else {
        e += " path=/;"
    }
    document.cookie = e
}
function deleteCookie(a, c) {
    var b = a + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    if (c !== undefined) {
        b += " path=/" + c + ";"
    }
    document.cookie = b
}
function getCookie(d) {
    var a = document.cookie.split("; ");
    for (var b = 0; b < a.length; b++) {
        if (a[b].indexOf(d + "=") !== -1) {
            var c = a[b].substring(a[b].indexOf("=") + 1);
            return c
        }
    }
    return undefined
}
function isEmptyObject(b) {
    for (var a in b) {
        if (b.hasOwnProperty(a)) {
            return false
        }
    }
    return true
}
;angular.module("mainModule", ["userModule", "announcementModule", "problemModule", "navModule", "submissionModule", "contestModule", "clarificationModule", "ngRoute"]).config(["$locationProvider", "$httpProvider", "$routeProvider", function(a, c, b) {
    configLocation(a);
    configHttp(c);
    configRoute(b)
}
]).run(["$rootScope", "$route", "$routeParams", "ServerTimeSvc", function(b, d, c, a) {
    a.init();
    b.$on("$routeChangeSuccess", function() {
        if (typeof d.current.title === "function") {
            document.title = d.current.title(c)
        } else {
            document.title = d.current.title
        }
        if (d.current.meta.property !== undefined && d.current.meta.property !== null ) {
            for (var e in d.current.meta.property) {
                $('meta[property="' + e + '"]').remove();
                $("head").append('<meta property="' + e + '" content="' + d.current.meta.property[e] + '"/>')
            }
        }
        if (d.current.meta.name !== undefined && d.current.meta.name !== null ) {
            for (var e in d.current.meta.name) {
                $('meta[name="' + e + '"]').remove();
                $("head").append('<meta name="' + e + '" content="' + d.current.meta.name[e] + '"/>')
            }
        }
    })
}
]);
function configRoute(a) {
    a.when("/", {
        templateUrl: "/static/html/home.html",
        title: "PSU Online Judge",
        meta: {
            property: {
                "og:description": "Jollybee Online Judge, competitive programmers' hive to train their skills!"
            }
        }
    }).when("/user/login", {
        templateUrl: "/static/html/login.html",
        controller: "UserCtrl",
        title: "Login",
        meta: {
            property: {
                "og:description": "Login to the hive!"
            }
        }
    }).when("/user/view/:username", {
        templateUrl: "/static/html/profile.html",
        title: function(b) {
            return "Profile - " + b.username
        },
        meta: {
            property: {
                "og:description": "Take a peek of your fellow bee profile!"
            }
        }
    }).when("/user/reset/password", {
        templateUrl: "/static/html/reset_password.html",
        title: "Reset Password",
        meta: {
            property: {
                "og:description": "Forget the password to this hive? Reset here!"
            }
        }
    }).when("/user/feedback", {
        templateUrl: "/static/html/feedback.html",
        title: "Feedback",
        meta: {
            property: {
                "og:description": "Have some suggestion? Want to report bugs?"
            }
        }
    }).when("/user/rank", {
        templateUrl: "/static/html/rank.html",
        title: "Ranks",
        meta: {
            property: {
                "og:description": "Jollybee Online Judge ranks."
            }
        }
    }).when("/problem", {
        templateUrl: "/static/html/problems.html",
        title: "Problems",
        meta: {
            property: {
                "og:description": "List of problems in this hive, help your fellow bees to solve the problems!"
            }
        }
    }).when("/problem/view/:problemId", {
        templateUrl: "/static/html/problem_detail.html",
        title: function(b) {
            return "Problem - " + b.problemId
        },
        meta: {
            property: {
                "og:description": "One of the problems to be solved. Other bees are solving this problem, can you help them?"
            }
        }
    }).when("/user/authoring", {
        templateUrl: "/static/html/authoring.html",
        title: "Authoring",
        meta: {
            property: {
                "og:description": "Make problems to be solved by others!"
            }
        }
    }).when("/user/mentorship", {
        templateUrl: "/static/html/mentorship.html",
        title: "Mentorship",
        meta: {
            property: {
                "og:description": "Tell me and I forget, teach me and I may remember, involve me and I learn."
            }
        }
    }).when("/user/contest", {
        templateUrl: "/static/html/contest.html",
        title: "Contests",
        meta: {
            property: {
                "og:description": "Like competition? Here is list of available contests!"
            }
        }
    }).when("/user/contest/:contestId/about", {
        templateUrl: "/static/html/includes/contest/about.html",
        title: "Contest - About",
        meta: {
            property: {
                "og:description": "What is this contest about? Find out the details here!"
            }
        }
    }).when("/user/contest/:contestId/problem", {
        templateUrl: "/static/html/includes/contest/problems.html",
        title: "Contest - Problem",
        meta: {
            property: {
                "og:description": "Bring it on!"
            }
        }
    }).when("/user/contest/:contestId/rating", {
        templateUrl: "/static/html/includes/contest/rating.html",
        title: "Contest - Rating Changes",
        meta: {
            property: {
                "og:description": "List of rating changes of contestants."
            }
        }
    }).when("/user/contest/:contestId/editorial", {
        templateUrl: "/static/html/includes/contest/editorial.html",
        title: "Contest - Editorial",
        meta: {
            property: {
                "og:description": "See the editorial of a contest. It's time to read and understand things!"
            }
        }
    }).when("/user/contest/:contestId/scoreboard", {
        templateUrl: "/static/html/includes/contest/scoreboard.html",
        title: "Contest - Scoreboard",
        meta: {
            property: {
                "og:description": "See current scoreboard of a contest. The queen is so proud of these bees.",
                "og:image": "https://jollybeeoj.com/images/contest_scoreboard.png"
            }
        }
    }).when("/user/contest/:contestId/judgestatus", {
        templateUrl: "/static/html/includes/contest/judge_status.html",
        title: "Contest - Judge Status",
        meta: {
            property: {
                "og:description": "See current status of submission. Queen's workers are ready to take more submission to be judged."
            }
        }
    }).when("/user/contest/:contestId/clarification", {
        templateUrl: "/static/html/includes/contest/clarification.html",
        title: "Contest - Clarification",
        meta: {
            property: {
                "og:description": "Found ambiguous description in a problem, ask here! Queen's workers will gladly answer your question."
            }
        }
    }).when("/user/contest/:contestId/problem/:problemId", {
        templateUrl: "/static/html/includes/contest/problem_detail.html",
        title: "Contest - Problem",
        meta: {
            property: {
                "og:description": "Bring it on!"
            }
        }
    }).when("/user/contest/:contestId/submission/:submissionId", {
        templateUrl: "/static/html/includes/contest/submission_detail.html",
        title: "Contest - Submission",
        meta: {
            property: {
                "og:description": "See specific submission in details."
            }
        }
    }).when("/submission", {
        templateUrl: "/static/html/submissions.html",
        title: "Submissions",
        meta: {
            property: {
                "og:description": "Queen's workers always stand by to get more submission to be judged. This is the list of last submission submitted and judged."
            }
        }
    }).when("/submission/view/:submissionId", {
        templateUrl: "/static/html/submission_detail.html",
        title: function(b) {
            return "Submission - " + b.submissionId
        },
        meta: {
            property: {
                "og:description": "See specific submission in details."
            }
        }
    }).when("/user/about", {
        templateUrl: "/static/html/about.html",
        title: "About Jollybee Online Judge",
        meta: {
            property: {
                "og:description": "What is Jollybee Online Judge?"
            }
        }
    }).when("/user/tools", {
        templateUrl: "/static/html/tools.html",
        title: "Tools",
        meta: {
            property: {
                "og:description": "Need something to update or manage the hive? Sure thing!"
            }
        }
    }).when("/user/policies/privacy", {
        templateUrl: "/static/html/privacy.html",
        title: "Privacy Policy"
    }).when("/user/policies/terms", {
        templateUrl: "/static/html/terms.html",
        title: "Terms and Conditions"
    }).otherwise({
        redirectTo: "/"
    })
}
function configLocation(a) {
    a.html5Mode(true);
    a.hashPrefix("#!")
}
function configHttp(a) {
    a.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
    var b = function(f) {
        var k = "", c, l, g, d, h, j, e;
        for (c in f) {
            l = f[c];
            if (l instanceof Array) {
                for (e = 0; e < l.length; ++e) {
                    h = l[e];
                    g = c + "[" + e + "]";
                    j = {};
                    j[g] = h;
                    k += b(j) + "&"
                }
            } else {
                if (l instanceof Object) {
                    for (d in l) {
                        h = l[d];
                        g = c + "[" + d + "]";
                        j = {};
                        j[g] = h;
                        k += b(j) + "&"
                    }
                } else {
                    if (l !== undefined && l !== null ) {
                        k += encodeURIComponent(c) + "=" + encodeURIComponent(l) + "&"
                    }
                }
            }
        }
        return k.length ? k.substr(0, k.length - 1) : k
    }
    ;
    a.defaults.transformRequest = [function(c) {
        return angular.isObject(c) && String(c) !== "[object File]" ? b(c) : c
    }
    ]
}
;angular.module("navModule", ["helperModule", "userModule"]).controller("NavCtrl", ["$scope", "$http", "$location", function(a, c, b) {
    a.navIndex = -1;
    a.setIndex = function(d) {
        a.navIndex = d
    }
    ;
    a.refreshHeaderNav = function(e, f) {
        a.navIndex = -1;
        var d = b.path();
        if (d === "/") {
            a.navIndex = 0
        } else {
            if (d.indexOf("/problem") !== -1) {
                a.navIndex = 1
            } else {
                if (d.indexOf("/submission") !== -1) {
                    a.navIndex = 2
                } else {
                    if (d.indexOf("/user/contest") !== -1) {
                        a.navIndex = 3
                    } else {
                        if (d.indexOf("/user/rank") !== -1) {
                            a.navIndex = 4
                        } else {
                            if (d.indexOf("/user/about") !== -1) {
                                a.navIndex = 5
                            } else {
                                if (d.indexOf("/user/tools") !== -1) {
                                    a.navIndex = 6
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ;
    a.$on("$routeChangeSuccess", a.refreshHeaderNav)
}
]).controller("ToolsNavCtrl", ["$scope", "$http", "$location", "UserDataSvc", "Helper", function(a, e, d, c, b) {
    a.cookieName = "ToolIndex";
    a.currentTool = "";
    a.authorizedTools = [];
    a.toolsName = ["Add Problem", "Update Problem", "Add Contest", "Update Contest", "Add Problem To Contest", "Update Problem In Contest", "Manage User In Contest", "Add New Role", "Edit Role's Power", "Change User's Role", "Add Announcement", "Update Announcement", "Rejudge Submission", "Manage Coin", "Manage Proposed Problem"];
    a.pages = ["/static/html/includes/tools/add_problem.html", "/static/html/includes/tools/update_problem.html", "/static/html/includes/tools/add_contest.html", "/static/html/includes/tools/update_contest.html", "/static/html/includes/tools/add_contest_problem.html", "/static/html/includes/tools/update_contest_problem.html", "/static/html/includes/tools/manage_contest_user.html", "/static/html/includes/tools/add_new_role.html", "/static/html/includes/tools/edit_role_power.html", "/static/html/includes/tools/change_user_role.html", "/static/html/includes/tools/add_announcement.html", "/static/html/includes/tools/update_announcement.html", "/static/html/includes/tools/rejudge_submission.html", "/static/html/includes/tools/manage_coin.html", "/static/html/includes/tools/manage_proposed_problem.html"];
    a.currentPage = "/static/html/includes/empty.html";
    a.switchTools = function(g) {
        var f = a.toolsName.indexOf(g);
        if (f !== -1) {
            a.currentTool = g;
            a.currentPage = a.pages[f];
            b.setCookie(a.cookieName, f)
        }
    }
    ;
    a.getLastTool = function() {
        if (c.getData() !== undefined && c.getData().hasPower) {
            var f = b.getCookie(a.cookieName);
            if (f !== undefined) {
                a.switchTools(a.toolsName[f])
            } else {
                a.switchTools(a.toolsName[0])
            }
        }
    }
    ;
    a.getAuthorizedTools = function() {
        e.post("user/tools").success(function(f) {
            a.authorizedTools = f
        }).error(function(f) {
            console.log("error");
            console.log(f)
        })
    }
    ;
    a.getLastTool()
}
]).controller("ContestNavCtrl", ["$scope", "$http", "$location", "$routeParams", "UserDataSvc", "Helper", function(a, f, e, c, d, b) {
    a.currContestId = c.contestId;
    a.contestMenuIndex = -1;
    a.cookieName = "ContestIndex";
    a.pages = ["/about", "/problem", "/judgestatus", "/clarification", "/scoreboard", "/rating", "/editorial"];
    a.currentPage = "";
    a.getContestMenu = function() {
        var h = e.path();
        for (var g = 0; g < a.pages.length; g++) {
            if (h.indexOf(a.pages[g]) !== -1) {
                a.contestMenuIndex = g;
                if (g === 1 && h.indexOf(a.pages[g]) !== h.length - a.pages[g].length) {
                    a.contestMenuIndex = 7
                }
                break
            }
        }
    }
    ;
    a.getContestMenu()
}
]);
angular.module("problemModule", ["helperModule", "submissionModule", "userModule"]).filter("elapsedTime", function() {
    var a = function(b, c) {
        if (b > 1) {
            c += "s"
        }
        return b + " " + c + " ago"
    }
    ;
    return function(b) {
        if (b === NaN) {
            return ""
        }
        b = Math.floor(b / 1000);
        if (b < 60) {
            return a(b, "second")
        }
        b = Math.floor(b / 60);
        if (b < 60) {
            return a(b, "minute")
        }
        b = Math.floor(b / 60);
        if (b < 24) {
            return a(b, "hour")
        }
        b = Math.floor(b / 24);
        if (b < 365) {
            return a(b, "day")
        }
        b = Math.floor(b / 365);
        return a(b, "year")
    }
}).directive("fileModel", ["$parse", function(a) {
    return {
        restrict: "A",
        link: function(f, e, d) {
            var c = a(d.fileModel);
            var b = c.assign;
            e.bind("change", function() {
                f.$apply(function() {
                    b(f, e[0].files[0])
                })
            })
        }
    }
}
]).directive("fileModelR", ["$parse", function(a) {
    return {
        restrict: "A",
        link: function(f, e, d) {
            var c = a(d.fileModelR);
            var b = c.assign;
            e.bind("change", function() {
                f.$apply(function() {
                    b(f, e[0].files[0])
                });
                f.addProblemImage()
            })
        }
    }
}
]).filter("textareaMentionFilter", function() {
    return function(b, f) {
        var d = "";
        if (b === undefined || b === null ) {
            return d
        }
        for (var c = 0; c < b.length; c++) {
            if (b[c] === "&") {
                d += "&amp;"
            } else {
                if (b[c] === "<") {
                    d += "&lt;"
                } else {
                    if (b[c] === ">") {
                        d += "&gt;"
                    } else {
                        if (b[c] === "\n") {
                            d += "<br>&#8203;"
                        } else {
                            d += b[c]
                        }
                    }
                }
            }
        }
        d = d.replace(/(http[s]?:\/\/[A-Za-z0-9-._~:\/?#\[\]@!$&'()*+,;=]*)/g, '<a href="$1" target="_blank">$1</a>');
        if (f.scope[f.mentionArray] === undefined || f.scope[f.mentionArray] === null ) {
            return d
        }
        for (var c = f.scope[f.mentionArray].length - 1; c >= 0; c--) {
            var h = f.scope[f.mentionArray][c].username;
            var a = f.scope[f.mentionArray][c].color;
            var e = new RegExp("\\b" + h + "\\b","g");
            var g = d.replace(e, '<a onmouseover="addHoverCard_username(this, &quot;' + h + '&quot;)" onmouseleave="removeHoverCard()" href="/user/view/' + h + '" target="_blank" class="username" style="color:' + a + '">' + h + "</a>");
            if (d == g) {
                f.scope[f.mentionArray].splice(c, 1)
            } else {
                d = g
            }
        }
        return d
    }
}).directive("textareaMention", function() {
    return {
        require: "ngModel",
        scope: false,
        link: function(e, d, c, g) {
            var b = function(n, p) {
                var l;
                var h = "";
                var o = 0;
                var m = false;
                var k = false;
                var j = false;
                for (l = 0; l < n.length && (o < p || j); l++) {
                    if (n[l] === "<") {
                        m = true
                    } else {
                        if (n[l] === ">") {
                            m = false;
                            if (h !== "br") {
                                j = !j
                            }
                            h = ""
                        } else {
                            if (n[l] === "&") {
                                k = true
                            } else {
                                if (n[l] === ";" && k) {
                                    k = false,
                                    o++
                                } else {
                                    if (!m && !k) {
                                        o++
                                    }
                                    if (m) {
                                        h += n[l]
                                    }
                                }
                            }
                        }
                    }
                }
                return l
            }
            ;
            var f = function(l, m, n) {
                var k = l.html();
                var j = n;
                if (k === undefined) {
                    k = ""
                }
                if (k[n] === "\n") {
                    j++
                }
                var h = k.slice(j);
                k = k.slice(0, j);
                k = [k, m, h].join("");
                l.html(k)
            }
            ;
            var a = function() {
                e.$apply(function() {
                    var j = c.displayModel;
                    var l = $(c.mentionDisplay + "Caret");
                    var n;
                    if (c.useParentScope === "true") {
                        n = e.$parent
                    } else {
                        n = e
                    }
                    if (n[j] === undefined) {
                        n[j] = ""
                    }
                    var h = "";
                    for (var m = 0; m < n[j].length; m++) {
                        if (n[j][m] === "\n") {
                            h += "\n"
                        } else {
                            h += " "
                        }
                    }
                    l.html(h);
                    $("blink").remove();
                    var p = getCaretPosition(d[0]);
                    if (p - 1 < 0 || n[j][p - 1] === "\n") {
                        f(l, "<blink style='left:3px; position:absolute;'>|</blink>", p)
                    } else {
                        f(l, "<blink>|</blink>", p - 1)
                    }
                    var q = d.val();
                    var o = "";
                    for (var m = p - 1; m >= 0; m--) {
                        if ((q[m] >= "a" && q[m] <= "z") || (q[m] >= "A" && q[m] <= "Z") || (q[m] >= "0" && q[m] <= "9")) {
                            o = q[m] + o
                        } else {
                            break
                        }
                    }
                    var k = c.textareaMention;
                    if (q[m] !== "@") {
                        e.autocomplete.mention[k] = "";
                        return
                    }
                    for (var m = p; m < q.length; m++) {
                        if ((q[m] >= "a" && q[m] <= "z") || (q[m] >= "A" && q[m] <= "Z") || (q[m] >= "0" && q[m] <= "9")) {
                            o += q[m]
                        } else {
                            break
                        }
                    }
                    e.autocomplete.mention[k] = o
                })
            }
            ;
            d.bind("input", function(h) {
                e.$apply(function() {
                    var j;
                    if (c.useParentScope === "true") {
                        j = e.$parent
                    } else {
                        j = e
                    }
                    var i = c.displayModel;
                    j[i] = d.val()
                });
                a()
            });
            d.bind("keydown keyup", function(h) {
                e.$apply(function() {
                    var n = $(c.typeaheadTextareaId)[0].attributes.getNamedItem("aria-owns").value;
                    if (h.keyCode === 40 && angular.element("ul[typeahead-popup][id='" + n + "']").scope().matches.length > 0) {
                        h.preventDefault();
                        if (h.type === "keydown") {
                            angular.element("ul[typeahead-popup][id='" + n + "']").scope().activeIdx++;
                            angular.element("ul[typeahead-popup][id='" + n + "']").scope().activeIdx %= angular.element("ul[typeahead-popup][id='" + n + "']").scope().matches.length
                        }
                    } else {
                        if (h.keyCode === 38 && angular.element("ul[typeahead-popup][id='" + n + "']").scope().matches.length > 0) {
                            h.preventDefault();
                            if (h.type === "keydown") {
                                angular.element("ul[typeahead-popup][id='" + n + "']").scope().activeIdx--;
                                if (angular.element("ul[typeahead-popup][id='" + n + "']").scope().activeIdx < 0) {
                                    angular.element("ul[typeahead-popup][id='" + n + "']").scope().activeIdx = angular.element("ul[typeahead-popup][id='" + n + "']").scope().matches.length - 1
                                }
                            }
                        } else {
                            if (h.keyCode === 13 && (angular.element("ul[typeahead-popup][id='" + n + "']").scope().matches.length > 0 || h.typeaheadMatchModel !== undefined)) {
                                h.preventDefault();
                                if (h.type === "keydown") {
                                    var l;
                                    if (angular.element("ul[typeahead-popup][id='" + n + "']").scope().matches.length > 0) {
                                        l = angular.element("ul[typeahead-popup][id='" + n + "']").scope().matches[angular.element("ul[typeahead-popup][id='" + n + "']").scope().activeIdx].model
                                    } else {
                                        l = h.typeaheadMatchModel
                                    }
                                    var r = l.username;
                                    var w = d.val();
                                    var u = getCaretPosition(d[0]);
                                    var p;
                                    var o;
                                    for (var p = u - 1; p >= 0; p--) {
                                        if (!((w[p] >= "a" && w[p] <= "z") || (w[p] >= "A" && w[p] <= "Z") || (w[p] >= "0" && w[p] <= "9"))) {
                                            break
                                        }
                                    }
                                    for (var o = u; o < w.length; o++) {
                                        if (!((w[o] >= "a" && w[o] <= "z") || (w[o] >= "A" && w[o] <= "Z") || (w[o] >= "0" && w[o] <= "9"))) {
                                            break
                                        }
                                    }
                                    if (p - 1 >= 0) {
                                        if ((w[p - 1] >= "a" && w[p - 1] <= "z") || (w[p - 1] >= "A" && w[p - 1] <= "Z") || (w[p - 1] >= "0" && w[p - 1] <= "9")) {
                                            r = " " + r
                                        }
                                    }
                                    var q = w.slice(o);
                                    w = w.slice(0, p);
                                    d.val([w, r, q].join(""));
                                    setCaretPosition(d[0], w.length + r.length);
                                    var m = c.displayModel;
                                    var t;
                                    if (c.useParentScope === "true") {
                                        t = e.$parent
                                    } else {
                                        t = e
                                    }
                                    t[m] = d.val();
                                    var s = c.mentionArrayModel;
                                    if (t[s] === undefined || t[s] === null ) {
                                        t[s] = []
                                    }
                                    var k = false;
                                    for (var p = 0; p < t[s].length; p++) {
                                        if (l.username == t[s][p].username) {
                                            k = true;
                                            break
                                        }
                                    }
                                    if (!k) {
                                        t[s].push({
                                            username: l.username,
                                            color: l.ratingColor
                                        })
                                    }
                                }
                            }
                        }
                    }
                });
                a()
            });
            d.bind("blur", function(h) {
                $("blink").remove()
            });
            d.bind("mouseup", function(h) {
                a()
            })
        }
    }
}).directive("triggerTypeaheadMention", function() {
    function a(d, c, b, e) {
        d.$watch(function() {
            return d.autocomplete.mention[b.triggerTypeaheadMention]
        }, function() {
            e.$setViewValue(d.autocomplete.mention[b.triggerTypeaheadMention])
        })
    }
    return {
        link: a,
        require: "ngModel",
        restrict: "A",
        scope: false
    }
}).controller("ProblemCtrl", ["$scope", "$http", "$location", "$routeParams", "$window", "UserDataSvc", "Helper", "$sce", function(b, h, g, d, e, f, c, a) {
    b.addHoverCard_username = addHoverCard_username;
    b.removeHoverCard = removeHoverCard;
    b.userDataShared = {};
    b.autocomplete = {};
    b.isWorking = false;
    b.isShowingHidden = false;
    b.numOfProblemsToShow = 30;
    b.currPageNum = 1;
    b.totalPage = 0;
    b.totalProblems = 0;
    b.problemData = {
        defaultCheckerSpec: "ignoreMultipleWhitespaces"
    };
    b.contestData = {};
    b.problems = {};
    b.latestProblemComment = {};
    b.bookmarkProblem = {};
    b.visibleProblem = {
        sort: {
            column: "id",
            order: "asc"
        },
        pageType: "all"
    };
    b.hiddenProblems = {};
    b.pages = [];
    b.checkerMsg = "";
    b.msg = "";
    b.isContest = false;
    b.imageIds = [];
    b.grantedUsers = [];
    b.userStatusInContest = "";
    b.contestMenuProblemId = "";
    b.allowRevealProblemToPublic = false;
    b.contestProblemPath = {};
    b.browseProblemByContestStructure = [];
    b.problemByContestTreeAdjList = {};
    b.problemByContestOn = {};
    b.problemByContestParent = {};
    b.$watch(function() {
        return f.getData()
    }, function() {
        b.userDataShared = f.getData()
    });
    b.prevPage = function() {
        if (b.currPageNum > 1) {
            b.currPageNum--;
            b.populateVisibleProblems()
        }
    }
    ;
    b.nextPage = function() {
        if (b.currPageNum < b.totalPage) {
            b.currPageNum++;
            b.populateVisibleProblems()
        }
    }
    ;
    b.getAutocompleteUsername = function(i) {
        if (i === "" || i === undefined || i === null ) {
            return
        }
        return h.post("/user/autocomplete", {
            pattern: i
        }).then(function(j) {
            return j.data
        })
    }
    ;
    b.getBrowseProblemByContestStructure = function() {
        b.browseProblemByContestStructure = c.getBrowseProblemByContestStructure();
        var j = [];
        var l = 0;
        var i = {};
        var k = function(p, r, s) {
            for (var m in p) {
                l++;
                b.problemByContestOn[l] = false;
                var n = p[m];
                var q = {};
                q.key = m;
                q.value = n;
                q.id = l;
                q.depth = r;
                q.isLeaf = true;
                q.pad = (16 + (r * 16)) + "px";
                if (i[s] === undefined || i[s] === null  || i[s] === "") {
                    i[s] = []
                }
                i[s].push(l);
                b.problemByContestParent[l] = s;
                if (angular.isObject(n)) {
                    q.isLeaf = false
                }
                j.push(q);
                if (angular.isObject(n)) {
                    k(n, r + 1, l)
                }
            }
        }
        ;
        k(b.browseProblemByContestStructure, 0, 0);
        b.problemByContestOn[0] = true;
        b.problemByContestTreeAdjList = i;
        b.browseProblemByContestStructure = j
    }
    ;
    b.getLatestProblemComment = function() {
        h.post("/problem/comment/latest").success(function(i) {
            b.latestProblemComment = i
        }).error(function(i) {
            console.log("error");
            console.log(i)
        })
    }
    ;
    b.clickBrowseProblemByContest = function(i) {
        var j = function(m) {
            if (b.problemByContestOn[m] === false) {
                return
            }
            if (b.problemByContestTreeAdjList[m] === undefined || b.problemByContestTreeAdjList[m] === null  || b.problemByContestTreeAdjList[m] === "") {
                return
            }
            b.problemByContestOn[m] = false;
            for (var k = 0; k < b.problemByContestTreeAdjList[m].length; k++) {
                var l = b.problemByContestTreeAdjList[m][k];
                if (b.problemByContestOn[l]) {
                    j(l)
                }
            }
        }
        ;
        if (b.problemByContestOn[i]) {
            j(i)
        } else {
            b.problemByContestOn[i] = true
        }
    }
    ;
    b.bookmarkProblem.add = function(i) {
        h.post("/problem/bookmark/add", {
            problemId: i.problemId
        }).success(function(j) {
            if (j) {
                i.isBookmarked = true
            }
        }).error(function(j) {
            console.log("error: " + j)
        })
    }
    ;
    b.bookmarkProblem.remove = function(i) {
        h.post("/problem/bookmark/remove", {
            problemId: i.problemId
        }).success(function(j) {
            if (j) {
                i.isBookmarked = false
            }
        }).error(function(j) {
            console.log("error: " + j)
        })
    }
    ;
    b.visibleProblem.changePageType = function(i) {
        b.visibleProblem.pageType = i;
        b.currPageNum = 1;
        b.populateVisibleProblems()
    }
    ;
    b.checkUserStatusInContest = function() {
        var i = new FormData();
        i.append("contestId", d.contestId);
        $.ajax({
            type: "POST",
            url: "/announcement/contest/user_status/check",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(j) {
                b.$apply(function() {
                    b.userStatusInContest = j;
                    b.refreshContestProblemPath()
                })
            },
            error: function(j) {
                console.log("error : " + j)
            }
        })
    }
    ;
    b.checkAllowRevealProblemToPublic = function() {
        h.post("/announcement/contest/problem/public/check/" + d.contestId).success(function(i) {
            if (i === true || i === false) {
                b.allowRevealProblemToPublic = i
            }
            b.refreshContestProblemPath()
        }).error(function(i) {
            console.log("error " + i)
        })
    }
    ;
    b.truncateProblemTitle = function(j) {
        for (var k = 0; k < b.problems.length; k++) {
            if (b.problems[k].title.length > j) {
                b.problems[k].title = b.problems[k].title.substr(0, j) + "..."
            }
        }
    }
    ;
    b.populateVisibleProblems = function(j, k) {
        if (j !== null  && j !== undefined && !isNaN(j)) {
            b.currPageNum = j
        }
        if (k !== undefined && k !== null ) {
            if (b.visibleProblem.sort.column === k) {
                if (b.visibleProblem.sort.order === "asc") {
                    b.visibleProblem.sort.order = "desc"
                } else {
                    b.visibleProblem.sort.order = "asc"
                }
            } else {
                b.visibleProblem.sort.column = k;
                b.visibleProblem.sort.order = "asc"
            }
            c.setCookie("PASC", JSON.stringify(b.visibleProblem.sort), 3 * 30 * 24 * 60 * 60 * 1000, "")
        } else {
            var i = c.getCookie("PASC");
            if (i !== undefined && i !== null  && i !== "") {
                b.visibleProblem.sort = JSON.parse(i)
            }
        }
        h.post("problem/count", {
            bookmarks: (b.visibleProblem.pageType === "bookmarks")
        }).success(function(l) {
            b.totalPage = Math.ceil(l / b.numOfProblemsToShow);
            b.pages = c.getPageArr(b.currPageNum, b.totalPage)
        }).error(function(l) {
            console.log("error: " + l)
        });
        h.post("problem/view/simple/" + b.currPageNum, {
            sortColumn: b.visibleProblem.sort.column,
            sortOrder: b.visibleProblem.sort.order,
            bookmarks: (b.visibleProblem.pageType === "bookmarks")
        }).success(function(l) {
            b.visibleProblem.data = l;
            b.problems = l
        }).error(function(l) {
            console.log("error : " + l)
        })
    }
    ;
    b.populateHiddenProblems = function() {
        h.post("problem/view/hidden").success(function(i) {
            b.hiddenProblems = i;
            b.problems = b.hiddenProblems
        }).error(function(i) {
            console.log("error : " + i)
        })
    }
    ;
    b.toggleHiddenProblem = function() {
        b.isShowingHidden = !b.isShowingHidden;
        if (b.isShowingHidden) {
            b.populateHiddenProblems()
        } else {
            b.populateVisibleProblems()
        }
    }
    ;
    b.refreshContestProblemPath = function() {
        for (var i in b.problems) {
            var j = b.problems[i].problemId;
            if (b.allowRevealProblemToPublic === true) {
                b.contestProblemPath[j] = "/user/contest/" + d.contestId + "/problem/" + j;
                continue
            }
            if (b.userStatusInContest !== "Dummy User" && b.userStatusInContest !== "Special Privileged User" && b.userStatusInContest !== "Contestant") {
                break
            }
            b.contestProblemPath[j] = "/user/contest/" + d.contestId + "/problem/" + j
        }
    }
    ;
    b.addProblem = function() {
        b.isWorking = true;
        b.msg = "Processing...";
        if (b.problemData.defaultCheckerSpec === "exactMatch") {
            b.problemData.defaultCheckerExactMatch = true
        }
        var i = new FormData();
        angular.forEach(b.problemData, function(k, j) {
            this.append(j, k)
        }, i);
        i.append("testcaseInput", b.testcaseInput);
        i.append("testcaseOutput", b.testcaseOutput);
        i.append("testcaseChecker", b.testcaseChecker);
        if (b.problemData.hint === undefined || b.problemData.hint === null ) {
            i.append("hint", "")
        }
        if (b.problemData.descriptions.EN === undefined || b.problemData.descriptions.EN.problem === null) {
            i.append("descriptions.EN.problem", "")
        }
        if (b.problemData.descriptions.VI === undefined || b.problemData.descriptions.VI.problem === null) {
            i.append("descriptions.VI.problem", "")
        }
        if (b.problemData.descriptions.EN === undefined || b.problemData.descriptions.EN.input === null) {
            i.append("descriptions.EN.input", "")
        }
        if (b.problemData.descriptions.VI === undefined || b.problemData.descriptions.VI.input === null) {
            i.append("descriptions.VI.input", "")
        }
        if (b.problemData.descriptions.EN === undefined || b.problemData.descriptions.EN.output === null) {
            i.append("descriptions.EN.output", "")
        }
        if (b.problemData.descriptions.VI === undefined || b.problemData.descriptions.VI.output === null) {
            i.append("descriptions.VI.output", "")
        }
        if (b.problemData.descriptions.EN === undefined || b.problemData.descriptions.EN.note === null) {
            i.append("descriptions.EN.note", "")
        }
        if (b.problemData.descriptions.VI === undefined || b.problemData.descriptions.VI.note === null) {
            i.append("descriptions.VI.note", "")
        }
        $.ajax({
            type: "POST",
            url: "/problem/tools/add",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(j) {
                b.$apply(function() {
                    b.msg = j;
                    b.isWorking = false
                })
            },
            error: function(j) {
                b.isWorking = false;
                console.log("error");
                console.log(j)
            }
        })
    }
    ;
    b.updateProblem = function(j) {
        b.msg = "Processing...";
        b.isWorking = true;
        if (b.problemData.defaultCheckerSpec === "exactMatch") {
            b.problemData.defaultCheckerExactMatch = true
        }
        var i = new FormData();
        i.append("problemId", j);
        angular.forEach(b.problemData, function(l, k) {
            this.append(k, l)
        }, i);
        i.append("testcaseInput", b.testcaseInput);
        i.append("testcaseOutput", b.testcaseOutput);
        i.append("testcaseChecker", b.testcaseChecker);
        if (b.problemData.hint === undefined || b.problemData.hint === null ) {
            i.append("hint", "")
        }
        if (b.problemData.descriptions.EN.problem === undefined || b.problemData.descriptions.EN.problem === null) {
            i.append("descriptions.EN.problem", "")
        }
        if (b.problemData.descriptions.VI.problem === undefined || b.problemData.descriptions.VI.problem === null) {
            i.append("descriptions.VI.problem", "")
        }
        if (b.problemData.descriptions.EN.input === undefined || b.problemData.descriptions.EN.input === null) {
            i.append("descriptions.EN.input", "")
        }
        if (b.problemData.descriptions.EN.input === undefined || b.problemData.descriptions.EN.input === null) {
            i.append("descriptions.EN.input", "")
        }
        if (b.problemData.descriptions.EN.output === undefined || b.problemData.descriptions.EN.output === null) {
            i.append("descriptions.EN.output", "")
        }
        if (b.problemData.descriptions.EN.output === undefined || b.problemData.descriptions.EN.output === null) {
            i.append("descriptions.EN.output", "")
        }
        if (b.problemData.descriptions.EN.note === undefined || b.problemData.descriptions.EN.note === null) {
            i.append("descriptions.EN.note", "")
        }
        if (b.problemData.descriptions.VI.note === undefined || b.problemData.descriptions.VI.note === null) {
            i.append("descriptions.VI.note", "")
        }
        $.ajax({
            type: "POST",
            url: "/problem/tools/update",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(k) {
                b.$apply(function() {
                    b.msg = k;
                    b.isWorking = false;
                    b.updateGrantedUser()
                })
            },
            error: function(k) {
                b.isWorking = false;
                console.log("error");
                console.log(k)
            }
        })
    }
    ;
    b.updateContestProblem = function() {
        b.msg = "Processing...";
        b.isWorking = true;
        if (b.problemData.editorial !== null  && b.problemData.editorial !== undefined && b.problemData.editorial !== "") {
            h.post("/announcement/tools/editorial/add", {
                html: b.problemData.editorial,
                contestProblemId: b.problemData.problemId,
                contestId: b.contestData.contestId
            }).success(function(j) {}).error(function(j) {
                console.log("error: " + j)
            })
        }
        if (b.problemData.defaultCheckerSpec === "exactMatch") {
            b.problemData.defaultCheckerExactMatch = true
        }
        var i = new FormData();
        angular.forEach(b.problemData, function(k, j) {
            this.append(j, k)
        }, i);
        i.append("editorial", null );
        i.append("contestId", b.contestData.contestId);
        i.append("contestProblemId", b.problemData.problemId);
        i.append("testcaseInput", b.testcaseInput);
        i.append("testcaseOutput", b.testcaseOutput);
        i.append("testcaseChecker", b.testcaseChecker);
        if (b.problemData.descriptions.EN.problem === undefined || b.problemData.descriptions.EN.problem === null) {
            i.append("descriptions.EN.problem", "")
        }
        if (b.problemData.descriptions.VI.problem === undefined || b.problemData.descriptions.VI.problem === null) {
            i.append("descriptions.VI.problem", "")
        }
        if (b.problemData.descriptions.EN.input === undefined || b.problemData.descriptions.EN.input === null) {
            i.append("descriptions.EN.input", "")
        }
        if (b.problemData.descriptions.EN.input === undefined || b.problemData.descriptions.EN.input === null) {
            i.append("descriptions.EN.input", "")
        }
        if (b.problemData.descriptions.EN.output === undefined || b.problemData.descriptions.EN.output === null) {
            i.append("descriptions.EN.output", "")
        }
        if (b.problemData.descriptions.EN.output === undefined || b.problemData.descriptions.EN.output === null) {
            i.append("descriptions.EN.output", "")
        }
        if (b.problemData.descriptions.EN.note === undefined || b.problemData.descriptions.EN.note === null) {
            i.append("descriptions.EN.note", "")
        }
        if (b.problemData.descriptions.VI.note === undefined || b.problemData.descriptions.VI.note === null) {
            i.append("descriptions.VI.note", "")
        }
        $.ajax({
            type: "POST",
            url: "/problem/tools/contest/update",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(j) {
                b.$apply(function() {
                    b.msg = j;
                    b.isWorking = false
                })
            },
            error: function(j) {
                b.isWorking = false;
                console.log("error");
                console.log(j)
            }
        })
    }
    ;
    b.loadAuthorizedProblem = function() {
        $.ajax({
            type: "POST",
            url: "/problem/tools/data/problem",
            contentType: false,
            processData: false,
            cache: false,
            success: function(i) {
                b.$apply(function() {
                    b.problems = i
                })
            },
            error: function(i) {
                b.isWorking = false;
                console.log("error");
                console.log(i)
            }
        })
    }
    ;
    b.deleteContestChecker = function(j) {
        var i = new FormData();
        i.append("contestProblemId", j);
        i.append("contestId", b.contestData.contestId);
        b.isWorking = true;
        $.ajax({
            type: "POST",
            url: "/problem/tools/contest/delete_checker",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(k) {
                b.$apply(function() {
                    b.isWorking = false;
                    b.checkerMsg = k
                })
            },
            error: function(k) {
                b.isWorking = false;
                console.log("error");
                console.log(k)
            }
        })
    }
    ;
    b.deleteChecker = function(j) {
        var i = new FormData();
        i.append("problemId", j);
        b.isWorking = true;
        $.ajax({
            type: "POST",
            url: "/problem/tools/delete_checker",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(k) {
                b.$apply(function() {
                    b.isWorking = false;
                    b.checkerMsg = k
                })
            },
            error: function(k) {
                b.isWorking = false;
                console.log("error");
                console.log(k)
            }
        })
    }
    ;
    b.loadContestProblem = function(j, i) {
        b.problems = b.$parent.contestProblems;
        h.post("/problem/contest/" + d.contestId).success(function(l) {
            b.problems = l;
            if (b.problems !== "" && b.problems !== null  && b.problems !== undefined) {
                b.problems.sort(function k(n, m) {
                    if (n.problemCode < m.problemCode) {
                        return -1
                    }
                    if (n.problemCode > m.problemCode) {
                        return 1
                    }
                    return 0
                })
            }
            if (d.problemId !== undefined) {
                b.contestMenuProblemId = d.problemId
            }
            b.refreshContestProblemPath();
            if (j) {
                j(i)
            }
        }).error(function(k) {
            console.log("error");
            console.log(k)
        })
    }
    ;
    b.loadContestProblemByTools = function(i) {
        h.post("/problem/tools/data/problem_contest", {
            contestId: i
        }).success(function(k) {
            b.problems = k;
            b.problems.sort(function j(m, l) {
                if (m.problemCode < l.problemCode) {
                    return -1
                }
                if (m.problemCode > l.problemCode) {
                    return 1
                }
                return 0
            })
        }).error(function(j) {
            console.log("error");
            console.log(j)
        })
    }
    ;
    b.loadProblemData = function(i) {
        b.loadAllProblemImages(i);
        b.loadGrantedUser(i);
        b.msg = "";
        h.post("/problem/tools/view/" + i).success(function(j) {
            b.problemData = j;
            if (b.problemData.defaultCheckerExactMatch === true) {
                b.problemData.defaultCheckerSpec = "exactMatch"
            } else {
                b.problemData.defaultCheckerSpec = "ignoreMultipleWhitespaces"
            }
            delete b.problemData.defaultCheckerExactMatch
        }).error(function(j) {
            console.log(j)
        })
    }
    ;
    b.loadAllProblemImages = function(i) {
        h.post("/problem/tools/data/image", {
            problemId: i
        }).success(function(j) {
            b.imageIds = j
        }).error(function(j) {
            console.log("error");
            console.log(j)
        })
    }
    ;
    b.loadContestProblemData = function(i) {
        b.loadAllContestProblemImages(i);
        h.post("/problem/view/contest/" + i, {
            contestId: b.contestData.contestId
        }).success(function(k) {
            b.problemData = k;
            var j = new FormData();
            j.append("contestProblemId", i);
            j.append("contestId", b.contestData.contestId);
            $.ajax({
                url: "/announcement/contest/view/editorial",
                method: "POST",
                data: j,
                contentType: false,
                processData: false,
                cache: false,
                success: function(l) {
                    b.$apply(function() {
                        b.problemData.editorial = l
                    })
                },
                error: function(l) {
                    console.log("error: " + l)
                }
            });
            if (b.problemData.defaultCheckerExactMatch === true) {
                b.problemData.defaultCheckerSpec = "exactMatch"
            } else {
                b.problemData.defaultCheckerSpec = "ignoreMultipleWhitespaces"
            }
            delete b.problemData.defaultCheckerExactMatch
        }).error(function(j) {
            console.log(j)
        })
    }
    ;
    b.loadAllContestProblemImages = function(i) {
        h.post("/problem/tools/data/contest/image", {
            problemId: i,
            contestId: b.contestData.contestId
        }).success(function(j) {
            b.imageIds = j
        }).error(function(j) {
            console.log("error");
            console.log(j)
        })
    }
    ;
    b.addContestProblemImage = function() {
        var i = new FormData();
        i.append("contestId", b.contestData.contestId);
        i.append("problemId", b.problemData.problemId);
        i.append("imageFile", b.imageFile);
        b.isWorking = true;
        $.ajax({
            type: "POST",
            url: "/problem/tools/contest/image/add",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(j) {
                b.$apply(function() {
                    b.isWorking = false;
                    b.imageIds.push(j)
                })
            },
            error: function(j) {
                b.isWorking = false;
                console.log("error");
                console.log(j)
            }
        })
    }
    ;
    b.addProblemImage = function() {
        if (b.contestData.contestId !== undefined && b.contestData.contestId !== null ) {
            b.addContestProblemImage();
            return
        }
        var i = new FormData();
        i.append("problemId", b.problemData.problemId);
        i.append("imageFile", b.imageFile);
        b.isWorking = true;
        $.ajax({
            type: "POST",
            url: "/problem/tools/image/add",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(j) {
                b.$apply(function() {
                    b.isWorking = false;
                    b.imageIds.push(j)
                })
            },
            error: function(j) {
                b.isWorking = false;
                console.log("error");
                console.log(j)
            }
        })
    }
    ;
    b.deleteContestProblemImage = function(k, i) {
        var j = new FormData();
        j.append("contestId", b.contestData.contestId);
        j.append("imageId", k);
        b.isWorking = true;
        $.ajax({
            type: "POST",
            url: "/problem/tools/contest/image/delete",
            data: j,
            contentType: false,
            processData: false,
            cache: false,
            success: function(l) {
                b.$apply(function() {
                    b.isWorking = false;
                    b.imageIds.splice(i, 1)
                })
            },
            error: function(l) {
                b.isWorking = false;
                console.log("error");
                console.log(l)
            }
        })
    }
    ;
    b.deleteProblemImage = function(k, i) {
        var j = new FormData();
        j.append("problemId", b.problemData.problemId);
        j.append("imageId", k);
        b.isWorking = true;
        $.ajax({
            type: "POST",
            url: "/problem/tools/image/delete",
            data: j,
            contentType: false,
            processData: false,
            cache: false,
            success: function(l) {
                b.$apply(function() {
                    b.isWorking = false;
                    b.imageIds.splice(i, 1)
                })
            },
            error: function(l) {
                b.isWorking = false;
                console.log("error");
                console.log(l)
            }
        })
    }
    ;
    b.fullImgPath = function(i) {
        return "/problem/image/" + i
    }
    ;
    $("#inputUser").keyup(function(i) {
        if (i.keyCode === 13 && $("#inputUser").val() !== "") {
            b.$apply(function() {
                if ($.inArray(b.autocomplete.grantedUser, b.grantedUsers) === -1) {
                    b.grantedUsers.push(b.autocomplete.grantedUser)
                }
                b.autocomplete.grantedUser = ""
            })
        }
    });
    $("#addImgBtn").click(function() {
        $("#imgInput").click()
    });
    b.deleteGrantedUser = function(i) {
        b.grantedUsers.splice(i, 1)
    }
    ;
    b.loadGrantedUser = function(i) {
        h.post("/problem/tools/data/special_privilege", {
            problemId: i
        }).success(function(k) {
            b.grantedUsers = [];
            for (var j = 0; j < k.length; j++) {
                b.grantedUsers.push(k[j].username)
            }
        }).error(function(j) {
            console.log("error");
            console.log(j)
        })
    }
    ;
    b.updateGrantedUser = function() {
        b.isWorking = true;
        var i = new FormData();
        i.append("problemId", b.problemData.problemId);
        i.append("usernameList", b.grantedUsers);
        $.ajax({
            type: "POST",
            url: "/problem/tools/special_privilege/update",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(j) {
                b.$apply(function() {
                    b.isWorking = false
                });
                if (j !== "Success") {
                    b.$apply(function() {
                        b.grantMsg = ", but " + j.toString() + " for updating granted user"
                    })
                }
            },
            error: function(j) {
                b.isWorking = false;
                console.log("error");
                console.log(j)
            }
        })
    }
    ;
    b.loadAuthorizedContests = function() {
        h.post("/announcement/tools/contest/user/special_privilege").success(function(j) {
            b.contests = j;
            b.contests.sort(function i(l, k) {
                if (l.contestId < k.contestId) {
                    return 1
                }
                if (l.contestId > k.contestId) {
                    return -1
                }
                return 0
            })
        }).error(function(i) {
            console.log("error");
            console.log(i)
        })
    }
    ;
    b.addContestProblem = function() {
        b.isWorking = true;
        b.msg = "Processing...";
        if (b.problemData.defaultCheckerSpec === "exactMatch") {
            b.problemData.defaultCheckerExactMatch = true
        }
        var i = new FormData();
        angular.forEach(b.problemData, function(k, j) {
            this.append(j, k)
        }, i);
        i.append("testcaseInput", b.testcaseInput);
        i.append("testcaseOutput", b.testcaseOutput);
        i.append("testcaseChecker", b.testcaseChecker);
        if (b.problemData.descriptions.EN.problem === undefined || b.problemData.descriptions.EN.problem === null) {
            i.append("descriptions.EN.problem", "")
        }
        if (b.problemData.descriptions.VI.problem === undefined || b.problemData.descriptions.VI.problem === null) {
            i.append("descriptions.VI.problem", "")
        }
        if (b.problemData.descriptions.EN.input === undefined || b.problemData.descriptions.EN.input === null) {
            i.append("descriptions.EN.input", "")
        }
        if (b.problemData.descriptions.EN.input === undefined || b.problemData.descriptions.EN.input === null) {
            i.append("descriptions.EN.input", "")
        }
        if (b.problemData.descriptions.EN.output === undefined || b.problemData.descriptions.EN.output === null) {
            i.append("descriptions.EN.output", "")
        }
        if (b.problemData.descriptions.EN.output === undefined || b.problemData.descriptions.EN.output === null) {
            i.append("descriptions.EN.output", "")
        }
        if (b.problemData.descriptions.EN.note === undefined || b.problemData.descriptions.EN.note === null) {
            i.append("descriptions.EN.note", "")
        }
        if (b.problemData.descriptions.VI.note === undefined || b.problemData.descriptions.VI.note === null) {
            i.append("descriptions.VI.note", "")
        }
        $.ajax({
            type: "POST",
            url: "/problem/tools/contest/add",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(j) {
                b.$apply(function() {
                    b.msg = j;
                    b.isWorking = false
                })
            },
            error: function(j) {
                b.isWorking = false;
                console.log("error");
                console.log(j)
            }
        })
    }
}
]).controller("ProblemDetailCtrl", ["$scope", "$http", "$routeParams", "$sce", "$location", "Helper", "UserDataSvc", "$timeout", "ServerTimeSvc", function(i, f, h, g, c, d, a, b, e) {
    i.currentServerTime = null ;
    i.addHoverCard_username = addHoverCard_username;
    i.removeHoverCard = removeHoverCard;
    i.userDataShared = {};
    i.problemDetails = {};
    i.autocomplete = {
        mention: {},
        pattern: {}
    };
    i.comments = {
        show: false,
        data: [],
        currentPage: 1,
        totalPage: 1,
        textAdd: "",
        textAddHTML: ""
    };
    i.isWorking = false;
    i.currentPage = "prob_desc";
    i.editor = undefined;
    i.$watch(function() {
        return e.currentServerTime()
    }, function() {
        i.currentServerTime = e.currentServerTime()
    });
    i.$watch(function() {
        return a.getData()
    }, function() {
        i.userDataShared = a.getData()
    });
    i.$watch();
    i.changePage = function(j) {
        i.currentPage = j
    }
    ;
    i.parseToHTML = function(j) {
        return d.parseToHTML(g, j)
    }
    ;
    i.getAutocompleteUsername = function(j) {
        if (j === "" || j === undefined || j === null ) {
            return
        }
        return f.post("/user/autocomplete", {
            pattern: j
        }).then(function(k) {
            return k.data
        })
    }
    ;
    i.comments.typeaheadOnSelectCallback = function(m, k, j, l, n) {
        var o = jQuery.Event("keydown");
        o.which = 13;
        o.keyCode = 13;
        o.typeaheadMatchModel = m;
        setTimeout(function() {
            $(n).siblings(l).trigger(o)
        }, 100)
    }
    ;
    i.comments.prevPage = function() {
        if (i.comments.currentPage > 1) {
            i.comments.currentPage--
        }
        i.comments.pages = d.getPageArr(i.comments.currentPage, i.comments.totalPage);
        i.comments.get(i.comments.currentPage)
    }
    ;
    i.comments.nextPage = function() {
        if (i.comments.currentPage < i.comments.totalPage) {
            i.comments.currentPage++
        }
        i.comments.pages = d.getPageArr(i.comments.currentPage, i.comments.totalPage);
        i.comments.get(i.comments.currentPage)
    }
    ;
    i.comments.toggle = function() {
        i.comments.show = !i.comments.show;
        i.comments.get(i.comments.currentPage)
    }
    ;
    i.comments.toggleEditing = function(j, k) {
        if (i.comments.data[j].isEditing) {
            if (!k) {
                if (!(/\S/.test(i.comments.data[j].textEdit))) {
                    return
                }
                f.post("/problem/comment/edit", {
                    problemCommentId: i.comments.data[j].problemCommentId,
                    newComment: i.comments.finalizeComment(i["commentTextEditDisplay" + i.comments.data[j].problemCommentId], i.comments.data[j].problemCommentId)
                }).success(function(l) {
                    if (l) {
                        i.comments.initComment(l);
                        i.comments.data[j] = l;
                        i.comments.data[j].isEditing = false
                    }
                }).error(function(l) {
                    console.log("error: " + l)
                })
            } else {
                i.comments.data[j].isEditing = false;
                i["commentTextEditDisplay" + i.comments.data[j].problemCommentId] = i.comments.data[j].beforeEdit
            }
        } else {
            i.comments.data[j].isEditing = true;
            i.comments.data[j].beforeEdit = i["commentTextEditDisplay" + i.comments.data[j].problemCommentId];
            i.comments.data[j].textEdit = i["commentTextEditDisplay" + i.comments.data[j].problemCommentId]
        }
    }
    ;
    i.comments.vote = function(j, k) {
        if (isNaN(j)) {
            return
        }
        if (i.userDataShared === undefined) {
            return
        }
        if (k < -1) {
            k = -1
        }
        if (k > 1) {
            k = 1
        }
        if (k === i.comments.data[j].userVote) {
            k = 0
        }
        f.post("/problem/comment/vote", {
            problemCommentId: i.comments.data[j].problemCommentId,
            vote: k
        }).success(function(l) {
            if (l === true) {
                if (i.comments.data[j].userVote === -1) {
                    i.comments.data[j].hateCount--
                } else {
                    if (i.comments.data[j].userVote === 1) {
                        i.comments.data[j].likeCount--
                    }
                }
                if (k === 1) {
                    i.comments.data[j].likeCount++
                } else {
                    if (k === -1) {
                        i.comments.data[j].hateCount++
                    }
                }
                i.comments.data[j].userVote = k
            }
        }).error(function(l) {
            console.log("error: " + l)
        })
    }
    ;
    i.comments.finalizeComment = function(m, l, p) {
        var j;
        if (l != null ) {
            j = i["commentTextEditMentionArray" + l]
        } else {
            j = p
        }
        if (j && m) {
            for (var k = 0; k < j.length; k++) {
                var o = j[k];
                var n = new RegExp("\\b" + o.username + "\\b","");
                m = m.replace(n, "[[user:" + o.username + "]]")
            }
        }
        return m
    }
    ;
    i.comments.get = function(j) {
        if (isNaN(j)) {
            return
        }
        i.comments.currentPage = j;
        f.post("/problem/comment/count", {
            problemId: h.problemId
        }).success(function(k) {
            i.comments.totalPage = Math.ceil(k / 10);
            i.comments.pages = d.getPageArr(i.comments.currentPage, i.comments.totalPage)
        }).error(function(k) {
            console.log("error: " + k)
        });
        f.post("/problem/comment/get", {
            problemId: h.problemId,
            page: i.comments.currentPage
        }).success(function(l) {
            if (l) {
                if (l) {
                    for (var k = 0; k < l.length; k++) {
                        i.comments.initComment(l[k])
                    }
                }
                i.comments.data = l
            }
        }).error(function(k) {
            console.log("error: " + k)
        })
    }
    ;
    i.comments.initComment = function(o) {
        if (i["commentTextEditMentionArray" + o.problemCommentId] === undefined || i["commentTextEditMentionArray" + o.problemCommentId] === null ) {
            i["commentTextEditMentionArray" + o.problemCommentId] = []
        }
        var n = o.comment;
        var p = /\[\[user:([0-9a-zA-Z]+)]]\[([a-zA-Z#0-9]+)]/g;
        var m = p.exec(n);
        while (m != null ) {
            var k = false;
            for (var l = 0; l < i["commentTextEditMentionArray" + o.problemCommentId].length; l++) {
                if (m[1] == i["commentTextEditMentionArray" + o.problemCommentId][l].username) {
                    k = true;
                    break
                }
            }
            if (!k) {
                i["commentTextEditMentionArray" + o.problemCommentId].push({
                    username: m[1],
                    color: m[2]
                })
            }
            m = p.exec(n)
        }
        o.comment = o.comment.replace(p, "$1");
        i["commentTextEditDisplay" + o.problemCommentId] = o.comment
    }
    ;
    i.comments.getTextEditDisplayModel = function(j) {
        return i["commentTextEditDisplay" + j]
    }
    ;
    i.comments.add = function() {
        if (!(/\S/.test(i.commentTextAddDisplay))) {
            return
        }
        i.isWorking = true;
        if (hoverCard_username !== null ) {
            removeHoverCard(1)
        }
        var j = jQuery.Event("mouseleave");
        b(function() {
            $("#commentTypeahead").siblings(".commentBox").trigger(j);
            f.post("/problem/comment/add", {
                problemId: h.problemId,
                comment: i.comments.finalizeComment(i.commentTextAddDisplay, null , i.commentTextAddMentionArray)
            }).success(function(k) {
                if (k) {
                    i.comments.textAdd = "";
                    i.commentTextAddDisplay = "";
                    i.commentTextAddMentionArray = [];
                    if (i.comments.currentPage === 1) {
                        i.comments.initComment(k);
                        i.comments.data.unshift(k);
                        if (i.comments.data.length > 10) {
                            i.comments.data.pop()
                        }
                    } else {
                        i.comments.get(1)
                    }
                }
                i.isWorking = false
            }).error(function(k) {
                i.isWorking = false;
                console.log("error: " + k)
            })
        }, 100)
    }
    ;
    i.bookmarkProblem = {
        isBookmarked: false
    };
    i.bookmarkProblem.check = function() {
        f.post("/problem/bookmark/check", {
            problemId: h.problemId
        }).success(function(j) {
            i.bookmarkProblem.isBookmarked = j
        }).error(function(j) {
            console.log("error: " + j)
        })
    }
    ;
    i.bookmarkProblem.add = function() {
        f.post("/problem/bookmark/add", {
            problemId: h.problemId
        }).success(function(j) {
            if (j) {
                i.bookmarkProblem.isBookmarked = true
            }
        }).error(function(j) {
            console.log("error: " + j)
        })
    }
    ;
    i.bookmarkProblem.remove = function() {
        f.post("/problem/bookmark/remove", {
            problemId: h.problemId
        }).success(function(j) {
            if (j) {
                i.bookmarkProblem.isBookmarked = false
            }
        }).error(function(j) {
            console.log("error: " + j)
        })
    }
    ;
    i.hintMouseDown = function() {
        i.problemDetails.showHint = true
    }
    ;
    i.hintMouseUp = function() {
        i.problemDetails.showHint = false
    }
    ;
    i.populateProblemDetails = function() {
        f.post("problem/view/" + h.problemId).success(function(k) {
            i.problemDetails = k;
            i.problemDetails.showHint = false;
            var j = d.getCookie("problemDetailsLocale");
            if (j === undefined || (j !== "EN" && j !== "VI")) {
                i.problemDetails.locale = "EN"
            } else {
                i.problemDetails.locale = j
            }
            if (i.problemDetails.descriptions.EN === undefined || i.problemDetails.descriptions.EN.problem === null || i.problemDetails.descriptions.EN.problem === "undefined" || i.problemDetails.descriptions.EN.problem === "null" || i.problemDetails.descriptions.EN.problem === "") {
                i.problemDetails.localeAvailableEN = false
            } else {
                i.problemDetails.localeAvailableEN = true
            }
            if (i.problemDetails.descriptions.VI === undefined || i.problemDetails.descriptions.VI.problem === null || i.problemDetails.descriptions.VI.problem === "undefined" || i.problemDetails.descriptions.VI.problem === "null" || i.problemDetails.descriptions.VI.problem === "") {
                i.problemDetails.localeAvailableVI = false
            } else {
                i.problemDetails.localeAvailableVI = true
            }
            if (i.problemDetails["localeAvailable" + i.problemDetails.locale] === false) {
                if (i.problemDetails.locale === "EN") {
                    i.problemDetails.locale = "VI"
                } else {
                    i.problemDetails.locale = "EN"
                }
            }
            $("head > title").remove();
            $("head").append("<title>Problem - " + k.problemId + " - " + k.title + "</title>")
        }).error(function(j) {
            console.log("error : " + j)
        })
    }
    ;
    i.problemDetailChangeLocale = function(j) {
        i.problemDetails.locale = j;
        d.setCookie("problemDetailsLocale", j, 12 * 30 * 24 * 60 * 60 * 1000, "")
    }
    ;
    i.parseToHTML = function(j) {
        return d.parseToHTML(g, j)
    }
    ;
    i.populateContestProblemDetails = function() {
        f.post("problem/view/contest/" + h.problemId, {
            contestId: h.contestId
        }).success(function(k) {
            i.problemDetails = k;
            if (k === null  || k === "" || k === undefined) {
                c.path("/user/contest/" + h.contestId + "/problem")
            } else {
                var j = d.getCookie("problemDetailsLocale");
                if (j === undefined || (j !== "EN" && j !== "VI")) {
                    i.problemDetails.locale = "EN"
                } else {
                    i.problemDetails.locale = j
                }
                if (i.problemDetails.descriptions.EN.problem === undefined || i.problemDetails.descriptions.EN.problem === null || i.problemDetails.descriptions.EN.problem === "undefined" || i.problemDetails.descriptions.EN.problem === "null" || i.problemDetails.descriptions.EN.problem === "") {
                    i.problemDetails.localeAvailableEN = false
                } else {
                    i.problemDetails.localeAvailableEN = true
                }
                if (i.problemDetails.descriptions.VI.problem === undefined || i.problemDetails.descriptions.VI.problem === null || i.problemDetails.descriptions.VI.problem === "undefined" || i.problemDetails.descriptions.VI.problem === "null" || i.problemDetails.descriptions.VI.problem === "") {
                    i.problemDetails.localeAvailableVI = false
                } else {
                    i.problemDetails.localeAvailableVI = true
                }
                if (i.problemDetails["localeAvailable" + i.problemDetails.locale] === false) {
                    if (i.problemDetails.locale === "EN") {
                        i.problemDetails.locale = "VI"
                    } else {
                        i.problemDetails.locale = "EN"
                    }
                }
            }
        }).error(function(j) {
            console.log("error : " + j)
        })
    }
}
]);
$(document).ready(function() {
    $("body").tooltip({
        selector: "[data-toggle=tooltip]"
    });
    setInterval(function() {
        $("blink").each(function() {
            $(this).css("visibility", $(this).css("visibility") === "hidden" ? "" : "hidden")
        })
    }, 750)
});
var hoverCardPromise = null ;
var hoverCard_username = null ;
function addHoverCard(b, a) {
    $("#hoverCard").remove();
    $(b).append("<div onmouseenter='clearTimeout(hoverCardPromise)' onmouseleave='removeHoverCard()' id='hoverCard'>" + a + "</div>")
}
function removeHoverCard(a) {
    if (a === null  || a === undefined) {
        a = 500
    }
    clearTimeout(hoverCardPromise);
    hoverCardPromise = setTimeout(function() {
        $("#hoverCard").remove();
        hoverCard_username = null 
    }, a)
}
function addHoverCard_username(a, b) {
    if (!(typeof a.altKey == "undefined")) {
        a = a.target
    }
    if (b === hoverCard_username) {
        return
    }
    clearTimeout(hoverCardPromise);
    hoverCardPromise = setTimeout(function() {
        $.ajax({
            url: "/user/view/row/" + b,
            method: "POST",
            success: function(c) {
                if (c !== null  && c !== "") {
                    var d = "<table style='padding-right:0px;'><tr style='display:none;'></tr><tr><td><img style='width:100px; height:100px;' src='/user/profile/thumbnail/u/" + c.username + "' onerror='this.onerror=null; this.src=\"/images/default.jpg\";'></img></td><td style='padding-left:5px; text-align:left; vertical-align:top;'><table><tr style='display:none;'></tr><tr><td colspan=3><span style='font-size:20px;'>" + c.username + "</span></td></tr><tr><td colspan=3><span style='font-size:14px;'>" + c.ratingTitle + "</span></td></tr><tr style='color:black; font-weight:normal'><td>Name</td><td>:</td><td>" + c.name + "</td></tr><tr style='color:black; font-weight:normal'><td>Rating</td><td>:</td><td>" + c.rating + "</td></tr><tr style='color:black; font-weight:normal'><td>Level</td><td>:</td><td>" + (c.level + 1) + "</td></tr></table></td></tr></table>";
                    hoverCard_username = c.username;
                    addHoverCard(a, d)
                }
            },
            error: function(c) {
                console.log(c)
            }
        })
    }, 500)
}
var lastCaretPosition;
function getCaretCharacterOffsetWithin(b) {
    var e = 0;
    var f = b.ownerDocument || b.document;
    var d = f.defaultView || f.parentWindow;
    var a;
    if (typeof d.getSelection != "undefined") {
        a = d.getSelection();
        if (a.rangeCount > 0) {
            var c = d.getSelection().getRangeAt(0);
            var g = c.cloneRange();
            g.selectNodeContents(b);
            g.setEnd(c.endContainer, c.endOffset);
            e = g.toString().length
        }
    } else {
        if ((a = f.selection) && a.type != "Control") {
            var i = a.createRange();
            var h = f.body.createTextRange();
            h.moveToElementText(b);
            h.setEndPoint("EndToEnd", i);
            e = h.text.length
        }
    }
    return e
}
function getCaretPosition(b) {
    var c = 0;
    if (document.selection && navigator.appVersion.indexOf("MSIE 10") == -1) {
        b.focus();
        var a = document.selection.createRange();
        a.moveStart("character", -b.value.length);
        c = a.text.length
    } else {
        if (b.selectionStart || b.selectionStart == "0") {
            c = b.selectionStart
        }
    }
    return ( c) 
}
function setCaretPosition(b, c) {
    if (b.setSelectionRange) {
        b.focus();
        b.setSelectionRange(c, c)
    } else {
        if (b.createTextRange) {
            var a = b.createTextRange();
            a.collapse(true);
            a.moveEnd("character", c);
            a.moveStart("character", c);
            a.select()
        }
    }
}
function placeCaretAtEnd(b) {
    b.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var a = document.createRange();
        a.selectNodeContents(b);
        a.collapse(false);
        var d = window.getSelection();
        d.removeAllRanges();
        d.addRange(a)
    } else {
        if (typeof document.body.createTextRange != "undefined") {
            var c = document.body.createTextRange();
            c.moveToElementText(b);
            c.collapse(false);
            c.select()
        }
    }
}
;angular.module("submissionModule", ["helperModule", "ngAnimate", "userModule"]).value("ownSubmitBg", "#D4F9C4").directive("fileModel", ["$parse", function(a) {
    return {
        restrict: "A",
        link: function(f, e, d) {
            var c = a(d.fileModel);
            var b = c.assign;
            e.bind("change", function() {
                f.$apply(function() {
                    b(f, e[0].files[0])
                })
            })
        }
    }
}
]).controller("SubmissionCtrl", ["$scope", "$location", "$http", "$routeParams", "Helper", function(a, e, d, c, b) {
    a.addHoverCard_username = addHoverCard_username;
    a.removeHoverCard = removeHoverCard;
    a.msg = "";
    a.languages = [];
    a.selectedLang = {};
    a.problems = [];
    a.editor = undefined;
    a.editorRefreshMode = function() {
        if (a.editor === undefined || a.editor === null ) {
            if ($("#editor").length) {
                a.editor = ace.edit("editor");
                if (a.editor === undefined) {
                    return
                }
                a.editor.setShowPrintMargin(false)
            }
        }
        var f;
        if (a.selectedLang === "FPC") {
            f = "ace/mode/pascal"
        } else {
            if (a.selectedLang.startsWith("Java")) {
                f = "ace/mode/java"
            } else {
                if (a.selectedLang === "GNU C++" || a.selectedLang === "GNU C" || a.selectedLang === "GNU C++11") {
                    f = "ace/mode/c_cpp"
                } else {
                    if (a.selectedLang === "Python 2.7" || a.selectedLang === "Python 3.4") {
                        f = "ace/mode/python"
                    }
                }
            }
        }
        a.editor.getSession().setMode(f)
    }
    ;
    a.getLanguages = function() {
        d.post("/submission/view/language").success(function(f) {
            a.languages = f;
            a.selectedLang = a.languages[0];
            a.getLangCookie();
            if (a.editor === undefined && $("#editor").length) {
                a.editor = ace.edit("editor");
                if (a.editor === undefined) {
                    return
                }
                a.editor.setShowPrintMargin(false);
                a.editorRefreshMode()
            }
        }).error(function(f) {
            console.log("error:" + f)
        })
    }
    ;
    a.loadContestLanguage = function() {
        d.post("/submission/view/language/" + c.contestId).success(function(f) {
            a.languages = f;
            a.selectedLang = a.languages[0];
            a.getLangCookie()
        }).error(function(f) {
            console.log("error");
            console.log(f)
        })
    }
    ;
    a.loadContestProblem = function() {
        d.post("/problem/contest/" + c.contestId).success(function(g) {
            a.problems = g;
            if (a.problems !== null  && a.problems !== undefined && a.problems !== "") {
                a.problems.sort(function f(i, h) {
                    if (i.problemCode < h.problemCode) {
                        return -1
                    }
                    if (i.problemCode > h.problemCode) {
                        return 1
                    }
                    return 0
                })
            }
        }).error(function(f) {
            console.log("error");
            console.log(f)
        })
    }
    ;
    a.setLangCookie = function(f) {
        b.setCookie("selectedLang", f, (1000 * 60 * 60 * 24 * 365), "")
    }
    ;
    a.getLangCookie = function() {
        var g = b.getCookie("selectedLang");
        if (g !== undefined) {
            var f = a.languages.indexOf(g);
            a.selectedLang = a.languages[f]
        }
    }
    ;
    a.submit = function(h) {
        var f = "/submission/submit/" + h;
        if (a.selectedLang === null  || a.selectedLang === "" || a.selectedLang === undefined) {
            a.msg = "Please choose language";
            return
        }
        if (a.file === undefined || a.file === null ) {
            a.solutionText = a.editor.getValue()
        }
        if ((a.file === undefined || a.file === null ) && (a.solutionText === undefined || a.solutionText === null  || a.solutionText === "")) {
            a.msg = "No file chosen and editor is empty";
            return
        }
        a.msg = "Uploading...";
        if (a.file === undefined || a.file === null ) {
            if (a.solutionText.length > 1024 * 64) {
                a.msg = "Failed: maximum character is 65535 characters";
                return
            }
            var g = new FormData();
            g.append("language", a.selectedLang);
            g.append("solution", a.solutionText);
            if (c.contestId !== undefined) {
                f = "/submission/submit/contest/text";
                g.append("contestId", c.contestId);
                g.append("problemId", c.problemId)
            } else {
                f = "/submission/submit/" + h + "/text"
            }
            $.ajax({
                type: "POST",
                url: f,
                data: g,
                contentType: false,
                processData: false,
                cache: false,
                success: function(i) {
                    a.$apply(function() {
                        a.setLangCookie(a.selectedLang);
                        if (i.string !== undefined) {
                            a.msg = i.string
                        } else {
                            a.msg = i
                        }
                        if (a.msg === "Success") {
                            if (c.contestId !== undefined) {
                                e.path("/user/contest/" + c.contestId + "/judgestatus")
                            } else {
                                e.path("/submission")
                            }
                        }
                    })
                },
                error: function(i) {
                    console.log(i)
                }
            })
        } else {
            if (a.file.size > 1024 * 64) {
                a.msg = "Failed: maximum file size is 64KB";
                return
            }
            var g = new FormData();
            g.append("file", a.file);
            g.append("language", a.selectedLang);
            if (c.contestId !== undefined) {
                f = "/submission/submit/contest";
                g.append("contestId", c.contestId);
                g.append("problemId", c.problemId)
            }
            $.ajax({
                type: "POST",
                url: f,
                data: g,
                contentType: false,
                processData: false,
                cache: false,
                success: function(i) {
                    a.$apply(function() {
                        a.setLangCookie(a.selectedLang);
                        if (i.string !== undefined) {
                            a.msg = i.string
                        } else {
                            a.msg = i
                        }
                        if (a.msg === "Success") {
                            if (c.contestId !== undefined) {
                                e.path("/user/contest/" + c.contestId + "/judgestatus")
                            } else {
                                e.path("/submission")
                            }
                        }
                    })
                },
                error: function(i) {
                    console.log(i);
                    console.log("error : " + i)
                }
            })
        }
    }
    ;
    a.textSubmit = function() {
        var f = new FormData();
        angular.forEach(a.submissionData, function(h, g) {
            this.append(g, h)
        }, f);
        f.append("contestId", c.contestId);
        a.msg = "Uploading...";
        $.ajax({
            type: "POST",
            url: "/submission/submit/contest/text",
            data: f,
            contentType: false,
            processData: false,
            cache: false,
            success: function(g) {
                a.$apply(function() {
                    a.setLangCookie(a.selectedLang);
                    if (g.string !== undefined) {
                        a.msg = g.string
                    } else {
                        a.msg = g
                    }
                    if (a.msg === "Success") {
                        e.path("/user/contest/" + c.contestId + "/judgestatus")
                    }
                })
            },
            error: function(g) {
                console.log("error : " + g)
            }
        })
    }
    ;
    a.setMsgOnChange = function() {
        a.msg = ""
    }
}
]).controller("SubmissionToolsCtrl", ["$scope", "$http", "$location", "$sce", "$routeParams", "Helper", function(b, f, e, a, d, c) {
    b.submissionIdList = "";
    b.isWorking = false;
    b.msg = "";
    b.rejudgeSubmission = function() {
        b.msg = "Processing...";
        b.isWorking = true;
        var l = b.submissionIdList.split(",");
        var k = [];
        for (var j = 0; j < l.length; j++) {
            var g = parseInt(l[j]);
            if (isNaN(g) || g <= 0) {
                continue
            }
            if (k.indexOf(g) === -1) {
                k.push(g)
            }
        }
        var h = new FormData();
        h.append("submissionId", k);
        $.ajax({
            type: "POST",
            url: "/submission/tools/rejudge",
            data: h,
            contentType: false,
            processData: false,
            cache: false,
            success: function(i) {
                b.$apply(function() {
                    b.isWorking = false;
                    if (i.string !== undefined) {
                        b.msg = i.string
                    } else {
                        b.msg = i
                    }
                })
            },
            error: function(i) {
                console.log(i);
                b.isWorking = false;
                console.log("error : " + i)
            }
        })
    }
}
]).controller("SubmissionViewCtrl", ["$scope", "$http", "$location", "$sce", "$routeParams", "Helper", "UserDataSvc", "ownSubmitBg", "$interval", "ServerTimeSvc", function(i, f, b, g, h, c, a, j, d, e) {
    i.addHoverCard_username = addHoverCard_username;
    i.removeHoverCard = removeHoverCard;
    i.sterilizeUsername = c.sterilizeUsername;
    i.currPageNum = 1;
    i.submissions = [];
    i.submissionData = {};
    i.userDataShared = {};
    i.reconnectSubmissionSocketTimeout = undefined;
    i.reconnectContestSubmissionSocketTimeout = undefined;
    i.stompClient = undefined;
    i.socket = undefined;
    i.currPageNum = 1;
    i.numOfSubmission = 30;
    i.submissionCount = 0;
    i.totalPage = 0;
    i.pages = {};
    i.hasSpecialPrivilegeInContest = false;
    i.contestSubmissionFilter = {
        active: false
    };
    i.currentTime = null ;
    i.$watch(function() {
        return a.getData()
    }, function() {
        i.userDataShared = a.getData();
        i.checkHasSpecialPrivilegeInContest()
    });
    i.$watch(function() {
        return e.currentServerTime()
    }, function() {
        i.currentTime = e.currentServerTime()
    });
    i.$on("$routeChangeStart", function(k, l) {
        if (i.currentTimePromise !== null ) {
            d.cancel(i.currentTimePromise)
        }
    });
    i.getSubmissionLink = function(k, l) {
        return (k !== undefined) ? "/submission/view/" + l : undefined
    }
    ;
    i.getContestSubmissionLink = function(l, m, k) {
        return ((l !== undefined) || (k === true)) ? "/user/contest/" + h.contestId + "/submission/" + m : undefined
    }
    ;
    i.checkHasSpecialPrivilegeInContest = function() {
        if (a.getData() !== undefined && h.contestId !== null  && h.contestId !== undefined) {
            var k = {
                contestId: h.contestId
            };
            f.post("/announcement/contest/special/check", k).success(function(l) {
                i.hasSpecialPrivilegeInContest = l;
                i.populateContestSubmission()
            }).error(function(l) {
                console.log("error");
                console.log(l)
            })
        }
    }
    ;
    i.populateSubmission = function() {
        f.post("/submission/view/").success(function(k) {
            i.submissions = k;
            if (i.submissions !== undefined && i.submissions !== null  && i.submissions !== "") {
                i.submissions.forEach(function(l) {
                    if (i.userDataShared !== undefined && l.userId === i.userDataShared.userId) {
                        l.backgroundColor = j
                    }
                    l.verdictColor = c.getVerdictColor(l.verdict);
                    l.verdictDescription = c.getVerdictDescription(l.verdict);
                })
            }
            // i.connect() // TODO: websocket
        }).error(function(k) {
            console.log("error : " + k)
        })
    }
    ;
    i.prevPage = function() {
        if (i.currPageNum > 1) {
            i.currPageNum--;
            i.populateContestSubmission()
        }
    }
    ;
    i.nextPage = function() {
        if (i.currPageNum < i.totalPage) {
            i.currPageNum++;
            i.populateContestSubmission()
        }
    }
    ;
    i.populateFilteredContestSubmission = function(k) {
        if (k) {
            i.currPageNum = 1
        }
        i.contestSubmissionFilter.active = true;
        if (i.userDataShared !== undefined) {
            i.connectContest();
            if (i.contestSubmissionFilter.username === undefined || i.contestSubmissionFilter.username === null ) {
                i.contestSubmissionFilter.username = ""
            }
            if (i.contestSubmissionFilter.problemName === undefined || i.contestSubmissionFilter.problemName == null ) {
                i.contestSubmissionFilter.problemName = ""
            }
            if (i.contestSubmissionFilter.language === undefined || i.contestSubmissionFilter.language === null ) {
                i.contestSubmissionFilter.language = ""
            }
            if (i.contestSubmissionFilter.verdict === undefined || i.contestSubmissionFilter.verdict === null ) {
                i.contestSubmissionFilter.verdict = ""
            }
            f.post("/submission/view/contest/filter/" + h.contestId + "/" + i.currPageNum, i.contestSubmissionFilter).success(function(l) {
                i.submissions = l;
                if (i.userDataShared !== undefined) {
                    if (i.submissions !== null  && i.submissions !== undefined && i.submissions !== "") {
                        i.submissions.forEach(function(m) {
                            if (m.userId === i.userDataShared.userId) {
                                m.backgroundColor = j
                            }
                            m.verdictDescription = c.getVerdictDescription(m.verdict)
                        })
                    }
                }
            }).error(function(l) {
                console.log("error");
                console.log(l)
            });
            f.post("/submission/view/contest/count/filter/" + h.contestId, i.contestSubmissionFilter).success(function(l) {
                i.submissionCount = l;
                i.totalPage = Math.ceil(i.submissionCount / i.numOfSubmission);
                i.pages = c.getPageArr(i.currPageNum, i.totalPage)
            }).error(function(l) {
                console.log("error: ");
                console.log(l)
            })
        }
    }
    ;
    i.populateContestSubmission = function(k) {
        if (k !== undefined && !isNaN(k)) {
            i.currPageNum = k
        }
        if (i.contestSubmissionFilter.active === true) {
            i.populateFilteredContestSubmission();
            return
        }
        if (i.userDataShared !== undefined) {
            i.connectContest();
            f.post("/submission/view/contest/" + h.contestId + "/" + i.currPageNum).success(function(l) {
                i.submissions = l;
                if (i.userDataShared !== undefined) {
                    if (i.submissions !== null  && i.submissions !== undefined && i.submissions !== "") {
                        i.submissions.forEach(function(m) {
                            if (m.userId === i.userDataShared.userId) {
                                m.backgroundColor = j
                            }
                            m.verdictColor = c.getVerdictColor(m.verdict);
                            m.verdictDescription = c.getVerdictDescription(m.verdict);
                        })
                    }
                }
            }).error(function(l) {
                console.log("error");
                console.log(l)
            });
            f.post("/submission/view/contest/count/" + h.contestId).success(function(l) {
                i.submissionCount = l;
                i.totalPage = Math.ceil(i.submissionCount / i.numOfSubmission);
                i.pages = c.getPageArr(i.currPageNum, i.totalPage)
            }).error(function(l) {
                console.log("error: ");
                console.log(l)
            })
        }
    }
    ;
    i.$on("$routeChangeStart", function(k, l) {
        clearTimeout(i.reconnectSubmissionSocketTimeout);
        clearTimeout(i.reconnectContestSubmissionSocketTimeout);
        if (i.stompClient !== undefined && i.stompClient.connected) {
            i.stompClient.disconnect()
        }
    });
    i.connect = function() {
        i.socket = new SockJS((b.host() === "localhost") ? "https://localhost:8443/websocket/general/endpoint" : "https://jollybeeoj.com/websocket/general/endpoint");
        i.stompClient = Stomp.over(i.socket);
        i.stompClient.debug = null ;
        var l = function(m) {
            if (i.userDataShared !== undefined && m.userId === i.userDataShared.userId) {
                m.backgroundColor = j
            }
            m.verdictColor = c.getVerdictColor(m.verdict);
            m.verdictDescription = c.getVerdictDescription(m.verdict);
            i.submissions.unshift(m);
            if (i.submissions.length > 30) {
                i.submissions.pop()
            }
        }
        ;
        var k = function(m) {
            for (idx in i.submissions) {
                if (i.submissions[idx].submissionId === m.submissionId) {
                    i.submissions[idx].runtime = m.runtime;
                    i.submissions[idx].verdict = m.verdict;
                    i.submissions[idx].memory = m.memory;
                    i.submissions[idx].verdictColor = c.getVerdictColor(m.verdict);;
                    i.submissions[idx].verdictDescription = c.getVerdictDescription(i.submissions[idx].verdict);
                    break
                }
            }
        }
        ;
        i.stompClient.connect({}, function(m) {
            i.stompClient.subscribe("/websocket/subscribe/submission/live", function(n) {
                l(JSON.parse(n.body));
                i.$digest()
            });
            i.stompClient.subscribe("/websocket/subscribe/submission/live/update", function(n) {
                k(JSON.parse(n.body));
                i.$digest()
            })
        }, function(m) {
            i.reconnectSubmissionSocketTimeout = setTimeout(function() {
                i.connect()
            }, 10000)
        })
    }
    ;
    i.connectContest = function() {
        if (i.stompClient !== undefined && i.stompClient.connected) {
            return
        }
        i.socket = new SockJS((b.host() === "localhost") ? "https://localhost:8443/websocket/general/endpoint" : "https://jollybeeoj.com/websocket/general/endpoint");
        i.stompClient = Stomp.over(i.socket);
        i.stompClient.debug = null ;
        i.stompClient.connect(null , null , function(m) {
            var l = "/websocket/subscribe/contest/submission/live/" + h.contestId + ((i.hasSpecialPrivilegeInContest === true) ? ("") : ("/" + i.userDataShared.userId));
            var k = "/websocket/subscribe/contest/submission/live/update/" + h.contestId + ((i.hasSpecialPrivilegeInContest === true) ? ("") : ("/" + i.userDataShared.userId));
            i.stompClient.subscribe(l, function(n) {
                n = JSON.parse(n.body);
                if (n.userId === i.userDataShared.userId) {
                    n.backgroundColor = j
                }
                n.verdictColor = c.getVerdictColor(m.verdict);
                n.verdictDescription = c.getVerdictDescription(n.verdict);
                if (i.submissions === undefined || i.submissions === null  || i.submissions === "") {
                    i.submissions = []
                }
                if (i.contestSubmissionFilter.active === true) {
                    if (i.contestSubmissionFilter.username !== undefined && i.contestSubmissionFilter.username !== null  && i.contestSubmissionFilter.username !== "" && n.username.indexOf(i.contestSubmissionFilter.username) === -1) {
                        return
                    }
                    if (i.contestSubmissionFilter.problemName !== undefined && i.contestSubmissionFilter.problemName !== null  && i.contestSubmissionFilter.problemName !== "" && n.problemName.indexOf(i.contestSubmissionFilter.problemName) === -1) {
                        return
                    }
                    if (i.contestSubmissionFilter.language !== undefined && i.contestSubmissionFilter.language !== null  && i.contestSubmissionFilter.language !== "" && n.language.indexOf(i.contestSubmissionFilter.language) === -1) {
                        return
                    }
                    if (i.contestSubmissionFilter.verdict !== undefined && i.contestSubmissionFilter.verdict !== null  && i.contestSubmissionFilter.verdict !== "" && n.verdict.indexOf(i.contestSubmissionFilter.verdict) === -1) {
                        return
                    }
                }
                if (i.currPageNum === 1) {
                    i.submissions.unshift(n)
                }
                if (i.submissions.length > 30) {
                    i.submissions.pop()
                }
                i.$digest()
            });
            i.stompClient.subscribe(k, function(n) {
                n = JSON.parse(n.body);
                for (idx in i.submissions) {
                    if (i.submissions[idx].submissionId === n.submissionId) {
                        i.submissions[idx].runtime = n.runtime;
                        i.submissions[idx].verdict = n.verdict;
                        i.submissions[idx].memory = n.memory;
                        i.submissions[idx].verdictColor = c.getVerdictColor(n.verdict);
                        i.submissions[idx].verdictDescription = c.getVerdictDescription(i.submissions[idx].verdict);
                        break
                    }
                }
                i.$digest()
            })
        }, function(k) {
            i.reconnectContestSubmissionSocketTimeout = setTimeout(function() {
                i.connectContest()
            }, 10000)
        })
    }
    ;
    i.parseToHTML = function(k) {
        return c.parseToHTML(g, k)
    }
    ;
    i.populateSubmissionDetail = function() {
        f.post("/submission/view/" + h.submissionId).success(function(k) {
            i.submissionData = k;
            i.submissionData.verdictColor = c.getVerdictColor(i.submissionData.verdict);
            i.submissionData.verdictDescription = c.getVerdictDescription(i.submissionData.verdict);
            setTimeout(function() {
                Prism.highlightAll()
            }, 10)
        }).error(function(k) {
            console.log("error:");
            console.log(k)
        })
    }
    ;
    i.populateContestSubmissionDetail = function() {
        f.post("/submission/view/detail/contest/" + h.submissionId + "/" + h.contestId).success(function(k) {
            i.submissionData = k;
            i.submissionData.verdictDescription = c.getVerdictDescription(i.submissionData.verdict);
            setTimeout(function() {
                Prism.highlightAll()
            }, 10)
        }).error(function(k) {
            console.log("error:");
            console.log(k)
        })
    }
    ;
    i.contestProblemPath = function(k) {
        return "/user/contest/" + h.contestId + "/problem/" + k
    }
}
]);
angular.module("userModule", ["helperModule", "navModule", "ui.bootstrap"]).service("UserDataSvc", [function() {
    var a = {};
    var b = {};
    this.setNotification = function(c) {
        this.notification = c
    }
    ;
    this.getNotification = function() {
        return this.notification
    }
    ;
    this.setData = function(c) {
        this.userDataShared = c
    }
    ;
    this.getData = function() {
        return this.userDataShared
    }
}
]).service("ServerTimeSvc", ["$timeout", "$interval", "$http", function(a, e, g) {
    var c = null ;
    var b = null ;
    var d = function() {
        g.get("/announcement/get_server_time").success(function(f) {
            c = f;
            if (f === null  || f === "" || f === NaN) {
                a(function() {
                    d()
                }, 10000)
            }
        }).error(function(f) {
            a(function() {
                d()
            }, 10000)
        })
    }
    ;
    return {
        init: function() {
            d();
            e(function() {
                d()
            }, 600000);
            if (b === null ) {
                b = e(function() {
                    if (c === NaN) {
                        return
                    }
                    c += 1000
                }, 1000)
            }
        },
        currentServerTime: function() {
            return c
        }
    }
}
]).filter("powerIsNotAddedIn", function() {
    return function(b, d, e) {
        var c = d.powerList;
        var a = {};
        if (!c.hasOwnProperty(e)) {
            a = b
        } else {
            for (var f in b) {
                if (!c[e].hasOwnProperty(f)) {
                    a[f] = b[f]
                }
            }
        }
        return a
    }
}).directive("authoringTestcaseModelR", ["$parse", function(a) {
    return {
        restrict: "A",
        link: function(f, e, d) {
            var c = a(d.authoringTestcaseModelR);
            var b = c.assign;
            e.bind("change", function() {
                f.$apply(function() {
                    b(f, e[0].files[0])
                });
                f.authoring.uploadTestcase()
            })
        }
    }
}
]).controller("UserCtrl", ["$scope", "$http", "$location", "$routeParams", "Helper", "UserDataSvc", "$sce", "$q", function(c, h, g, e, d, f, a, b) {
    c.addHoverCard_username = addHoverCard_username;
    c.removeHoverCard = removeHoverCard;
    c.Math = window.Math;
    c.msg = "";
    c.feedbackMsg = "";
    c.loginView = "login";
    c.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    c.notification = {};
    c.userData = {};
    c.roleData = {};
    c.authoring = {
        data: {},
        detail: {}
    };
    c.mentorship = {
        addExerciseData: {},
        allSlotCount: 0,
        addGroupData: {},
        buySlotData: {
            numberOfSlots: 1,
            duration: 1
        },
        currentPage: "mentor",
        editGroupData: {},
        editSlotData: {},
        exerciseData: {},
        groupData: {},
        groupName: {},
        mentee: {
            showMentor: {}
        },
        mentor: {
            submissionStatisticData: [],
            submissionStatisticChart: [],
            plagiarism: {
                plagiarismResultData: {},
                highestPercentage: {}
            }
        },
        renewSlotData: {
            duration: 1,
            lockedCount: "...",
            source: "all slots"
        },
        showGroup: {
            "-1": true
        },
        showSlot: {
            "-1": false
        },
        slotActiveCount: 0,
        slotPage: 1,
        slotPerPage: 20,
        slotSortColumn: "mentorshipSlotId",
        slotSortOrder: "ASC"
    };
    c.userDataShared = {
        username: "Guest"
    };
    c.autocomplete;
    c.users = [];
    c.userCount = 0;
    c.rank = {
        rankPerPage: 30,
        currentPage: "rating",
        currentPageNumber: 1
    };
    c.badges = {
        data: [],
        detailIndex: -1
    };
    c.roles = [];
    c.rolePowers = {};
    c.powerList = {};
    c.manageCoin = {
        donateValue: 1,
        currentPage: 1,
        totalPage: 1,
        coin: "..."
    };
    c.resetUsername = "";
    c.resetNewPassword = "";
    c.resetConfirmNewPassword = "";
    c.resetToken = "";
    c.resetTokenSent = false;
    c.resetRequestMsg = "";
    c.isWorking = false;
    c.archiveSubmission = {
        submissionPerPage: 5
    };
    c.profileSettings = {};
    c.statisticMsg = "";
    c.compareStatisticWithUsername = "";
    c.compareStatisticUsernameList = [];
    c.submissionStatisticData = undefined;
    c.submissionStatisticChart = undefined;
    c.ratingStatisticRawData = undefined;
    c.ratingStatisticData = undefined;
    c.ratingStatisticChart = undefined;
    c.globalChartOptions = {
        animation: {
            duration: 1000,
            easing: "out",
            startup: true
        },
        legend: "none",
        hAxis: {
            textPosition: "none"
        },
        chartArea: {
            width: "80%",
            height: "90%"
        }
    };
    c.waitForFinalEvent = (function() {
        var i = {};
        return function(l, j, k) {
            if (!k) {
                k = "Don't call this twice without a uniqueId"
            }
            if (i[k]) {
                clearTimeout(i[k])
            }
            i[k] = setTimeout(l, j)
        }
    })();
    c.$watch(function() {
        return f.getNotification()
    }, function() {
        c.notification = f.getNotification()
    });
    c.$watch(function() {
        return f.getData()
    }, function() {
        c.userDataShared = f.getData()
    });
    c.$watch(function() {
        return c.compareStatisticUsernameList
    }, function() {
        c.statisticMsg = "";
        c.refreshSubmissionStatisticChart();
        c.refreshRatingStatisticChart()
    }, true);
    c.hexToRgb = function(l) {
        if (l === undefined) {
            return
        }
        var m = parseInt(l.substring(1), 16);
        var k = (m >> 16) & 255;
        var j = (m >> 8) & 255;
        var i = m & 255;
        return k + "," + j + "," + i
    }
    ;
    c.parseToHTML = function(i) {
        return d.parseToHTML(a, i)
    }
    ;
    c.parseDateReadable = function(i) {
        if (i) {
            var j = new Date(i);
            return ("0" + j.getDate()).slice(-2) + "-" + c.monthNames[j.getMonth()] + "-" + j.getFullYear() + " " + ("0" + j.getHours()).slice(-2) + ":" + ("0" + j.getMinutes()).slice(-2) + ":" + ("0" + j.getSeconds()).slice(-2)
        }
    }
    ;
    $("#authoringData").on("click", ".authoringTestcaseUploadBtn", function() {
        $("#authoringTestcaseUpload").click()
    });
    c.authoring.uploadTestcase = function() {
        var i = new FormData();
        if (c.testcaseFile.size > 10 * 1024 * 1024) {
            alert("Maximum file size is 10MB");
            return
        }
        i.append("authoringProblemId", c.authoring.detail.authoringProblemId);
        i.append("file", c.testcaseFile);
        $.ajax({
            type: "POST",
            url: "/user/authoring/tc/upload",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(j) {
                c.$apply(function() {
                    if (j !== "Success") {
                        alert(j)
                    } else {
                        c.authoring.get()
                    }
                })
            },
            error: function(j) {
                console.log("error");
                console.log(j)
            }
        })
    }
    ;
    c.authoring.get = function() {
        h.post("/user/authoring/get").success(function(k) {
            if (k !== "null" && k !== null ) {
                c.authoring.data.proc = [];
                c.authoring.data.published = [];
                for (var j = 0; j < k.length; j++) {
                    if (k[j].status === "published") {
                        c.authoring.data.published.push(k[j])
                    } else {
                        c.authoring.data.proc.push(k[j])
                    }
                }
            }
        }).error(function(i) {
            console.log(i)
        })
    }
    ;
    c.authoring.getDetail = function(i) {
        c.authoring.isWorking = true;
        h.post("/user/authoring/get/detail", {
            authoringProblemId: i
        }).success(function(j) {
            c.authoring.detail = j;
            if (c.authoring.detail.allowedJC === true) {
                c.authoring.detail.allowedJC = "true"
            } else {
                c.authoring.detail.allowedJC = "false"
            }
            c.authoring.isWorking = false
        }).error(function(j) {
            console.log(j)
        })
    }
    ;
    c.authoring.update = function() {
        var i = new FormData();
        c.authoring.msg = "All fields must be filled with correct values";
        if (c.authoring.detail.title === undefined || c.authoring.detail.title === null ) {
            return
        }
        if (c.authoring.detail.memoryLimit === undefined || c.authoring.detail.memoryLimit === null ) {
            return
        }
        if (c.authoring.detail.timeLimit === undefined || c.authoring.detail.timeLimit === null ) {
            return
        }
        if (c.authoring.detail.difficulty === undefined || c.authoring.detail.difficulty === null ) {
            return
        }
        if (c.authoring.detail.problemDescription === undefined || c.authoring.detail.problemDescription === null ) {
            return
        }
        if (c.authoring.detail.inputDescription === undefined || c.authoring.detail.inputDescription === null ) {
            return
        }
        if (c.authoring.detail.outputDescription === undefined || c.authoring.detail.outputDescription === null ) {
            return
        }
        if (c.authoring.detail.notes === undefined || c.authoring.detail.notes === null ) {
            return
        }
        if (c.authoring.detail.allowedJC === undefined || c.authoring.detail.allowedJC === null ) {
            return
        }
        if (c.authoring.detail.solution === undefined || c.authoring.detail.solution === null ) {
            return
        }
        c.authoring.msg = "Processing...";
        c.authoring.isWorking = true;
        for (key in c.authoring.detail) {
            if (c.authoring.detail.hasOwnProperty(key)) {
                i.append(key, c.authoring.detail[key])
            }
        }
        $.ajax({
            url: "/user/authoring/update",
            contentType: false,
            processData: false,
            cache: false,
            method: "POST",
            data: i,
            success: function(j) {
                c.$apply(function() {
                    c.authoring.msg = j;
                    if (j === "Success") {
                        for (var k = 0; k < c.authoring.data.proc.length; k++) {
                            if (c.authoring.data.proc[k].authoringProblemId === c.authoring.detail.authoringProblemId) {
                                c.authoring.data.proc[k].title = c.authoring.detail.title;
                                c.authoring.data.proc[k].allowedJC = c.authoring.detail.allowedJC;
                                break
                            }
                        }
                    }
                    c.authoring.isWorking = false
                })
            },
            error: function(j) {
                console.log(j)
            }
        })
    }
    ;
    c.authoring.repropose = function() {
        var i = new FormData();
        c.authoring.msg = "All fields must be filled with correct values";
        if (c.authoring.detail.title === undefined || c.authoring.detail.title === null ) {
            return
        }
        if (c.authoring.detail.memoryLimit === undefined || c.authoring.detail.memoryLimit === null ) {
            return
        }
        if (c.authoring.detail.timeLimit === undefined || c.authoring.detail.timeLimit === null ) {
            return
        }
        if (c.authoring.detail.difficulty === undefined || c.authoring.detail.difficulty === null ) {
            return
        }
        if (c.authoring.detail.problemDescription === undefined || c.authoring.detail.problemDescription === null ) {
            return
        }
        if (c.authoring.detail.inputDescription === undefined || c.authoring.detail.inputDescription === null ) {
            return
        }
        if (c.authoring.detail.outputDescription === undefined || c.authoring.detail.outputDescription === null ) {
            return
        }
        if (c.authoring.detail.notes === undefined || c.authoring.detail.notes === null ) {
            return
        }
        if (c.authoring.detail.allowedJC === undefined || c.authoring.detail.allowedJC === null ) {
            return
        }
        if (c.authoring.detail.solution === undefined || c.authoring.detail.solution === null ) {
            return
        }
        c.authoring.msg = "Processing...";
        c.authoring.isWorking = true;
        for (key in c.authoring.detail) {
            if (c.authoring.detail.hasOwnProperty(key)) {
                i.append(key, c.authoring.detail[key])
            }
        }
        $.ajax({
            url: "/user/authoring/repropose",
            contentType: false,
            processData: false,
            cache: false,
            method: "POST",
            data: i,
            success: function(j) {
                c.$apply(function() {
                    c.authoring.msg = j;
                    if (j === "Success") {
                        c.authoring.get()
                    }
                    c.authoring.isWorking = false
                })
            },
            error: function(j) {
                console.log(j)
            }
        })
    }
    ;
    c.authoring.add = function() {
        var i = new FormData();
        c.authoring.msg = "All fields must be filled with correct values";
        if (c.authoring.detail.title === undefined || c.authoring.detail.title === null ) {
            return
        }
        if (c.authoring.detail.memoryLimit === undefined || c.authoring.detail.memoryLimit === null ) {
            return
        }
        if (c.authoring.detail.timeLimit === undefined || c.authoring.detail.timeLimit === null ) {
            return
        }
        if (c.authoring.detail.difficulty === undefined || c.authoring.detail.difficulty === null ) {
            return
        }
        if (c.authoring.detail.problemDescription === undefined || c.authoring.detail.problemDescription === null ) {
            return
        }
        if (c.authoring.detail.inputDescription === undefined || c.authoring.detail.inputDescription === null ) {
            return
        }
        if (c.authoring.detail.outputDescription === undefined || c.authoring.detail.outputDescription === null ) {
            return
        }
        if (c.authoring.detail.notes === undefined || c.authoring.detail.notes === null ) {
            return
        }
        if (c.authoring.detail.allowedJC === undefined || c.authoring.detail.allowedJC === null ) {
            return
        }
        if (c.authoring.detail.solution === undefined || c.authoring.detail.solution === null ) {
            return
        }
        c.authoring.msg = "Processing...";
        c.authoring.isWorking = true;
        for (key in c.authoring.detail) {
            if (c.authoring.detail.hasOwnProperty(key)) {
                i.append(key, c.authoring.detail[key])
            }
        }
        $.ajax({
            url: "/user/authoring/add",
            contentType: false,
            processData: false,
            cache: false,
            method: "POST",
            data: i,
            success: function(j) {
                c.$apply(function() {
                    c.authoring.msg = j;
                    if (j === "Success") {
                        c.authoring.get()
                    }
                    c.authoring.isWorking = false
                })
            },
            error: function(j) {
                console.log(j)
            }
        })
    }
    ;
    c.authoring.tget = function() {
        h.post("/user/tools/authoring/get").success(function(k) {
            if (k !== null ) {
                c.authoring.data.proc = [];
                c.authoring.data.approved = [];
                for (var j = 0; j < k.length; j++) {
                    if (k[j].status === "approved") {
                        c.authoring.data.approved.push(k[j])
                    } else {
                        c.authoring.data.proc.push(k[j])
                    }
                }
            }
        }).error(function(i) {
            console.log(i)
        })
    }
    ;
    c.authoring.approve = function() {
        var i = new FormData();
        i.append("authoringProblemId", c.authoring.detail.authoringProblemId);
        i.append("status", "approved");
        if (confirm("Are you sure you want to approve this problem?")) {
            c.authoring.msg = "Processing...";
            c.authoring.isWorking = true;
            $.ajax({
                url: "/user/tools/authoring/status",
                contentType: false,
                processData: false,
                cache: false,
                method: "POST",
                data: i,
                success: function(j) {
                    c.$apply(function() {
                        c.authoring.msg = j;
                        if (j === "Success") {
                            c.authoring.tget()
                        }
                        c.authoring.isWorking = false
                    })
                },
                error: function(j) {
                    console.log(j)
                }
            })
        }
    }
    ;
    c.authoring.reject = function() {
        if (confirm("Are you sure you want to reject this problem?")) {
            c.authoring.msg = "Processing...";
            c.authoring.isWorking = true;
            var j = prompt("Enter reason of rejection:");
            var i = new FormData();
            i.append("authoringProblemId", c.authoring.detail.authoringProblemId);
            i.append("status", "rejected");
            i.append("message", j);
            $.ajax({
                url: "/user/tools/authoring/status",
                contentType: false,
                processData: false,
                cache: false,
                method: "POST",
                data: i,
                success: function(k) {
                    c.$apply(function() {
                        c.authoring.msg = k;
                        if (k === "Success") {
                            c.authoring.tget()
                        }
                        c.authoring.isWorking = false
                    })
                },
                error: function(k) {
                    console.log(k)
                }
            })
        }
    }
    ;
    c.authoring.publish = function() {
        if (confirm("Are you sure you want to publish this problem? After this problem is published, all testcases related to this problem will be deleted permanently from database")) {
            c.authoring.msg = "Processing...";
            c.authoring.isWorking = true;
            var k = prompt("Where will the problem be published? (example: 'Archive', 'Jolly Challenge #13', etc.)");
            var i = prompt("Enter the url of published problem:");
            if (k === null  || i === null  || k === "" || i === "") {
                return
            }
            var j = new FormData();
            j.append("authoringProblemId", c.authoring.detail.authoringProblemId);
            j.append("publishUrl", i);
            j.append("publishedIn", k);
            $.ajax({
                url: "/user/tools/authoring/publish",
                contentType: false,
                processData: false,
                cache: false,
                method: "POST",
                data: j,
                success: function(l) {
                    c.$apply(function() {
                        c.authoring.msg = l;
                        if (l === "Success") {
                            c.authoring.tget()
                        }
                        c.authoring.isWorking = false
                    })
                },
                error: function(l) {
                    console.log(l)
                }
            })
        }
    }
    ;
    c.authoring.getSpecific = function() {
        h.post("/user/tools/authoring/get/username", {
            username: c.authoring.specificUsername
        }).success(function(i) {
            c.authoring.data.specific = i
        }).error(function(i) {
            console.log(i)
        })
    }
    ;
    c.manageCoin.generatePageArray = function() {
        c.manageCoin.totalPage = Math.ceil(c.manageCoin.transactionHistoryCount / 10);
        c.manageCoin.pages = d.getPageArr(c.manageCoin.currentPage, c.manageCoin.totalPage)
    }
    ;
    c.manageCoin.getUserCoin = function() {
        h.post("/user/coin").success(function(i) {
            c.manageCoin.coin = i
        }).error(function(i) {
            console.log("error: " + i)
        })
    }
    ;
    c.manageCoin.getUserCoinTransaction = function(i) {
        if (!isNaN(i)) {
            c.manageCoin.currentPage = i
        }
        h.post("/user/coin/transaction/count").success(function(j) {
            c.manageCoin.transactionHistoryCount = j;
            c.manageCoin.generatePageArray()
        }).error(function(j) {
            console.log("error: " + j)
        });
        h.post("/user/coin/transaction", {
            pageNumber: c.manageCoin.currentPage
        }).success(function(j) {
            c.manageCoin.transactionHistory = j
        }).error(function(j) {
            console.log("error: " + j)
        })
    }
    ;
    c.manageCoin.prevPage = function() {
        if (c.manageCoin.currentPage <= 1) {
            return
        }
        c.manageCoin.currentPage--;
        c.manageCoin.getUserCoinTransaction()
    }
    ;
    c.manageCoin.nextPage = function() {
        if (c.manageCoin.currentPage >= c.manageCoin.totalPage) {
            return
        }
        c.manageCoin.currentPage++;
        c.manageCoin.getUserCoinTransaction()
    }
    ;
    c.badges.claimReward = function(i) {
        c.isWorking = true;
        h.post("/user/badge/claim", {
            badgeId: c.badges.data[i].badgeId
        }).success(function(j) {
            if (j) {
                c.badges.modalMessage = "Claim success, please refresh the page to see changes";
                c.badges.data[i].isClaimed = true
            } else {
                c.badges.modalMessage = "Claim failed."
            }
            c.isWorking = false
        }).error(function(j) {
            console.log("error: " + j);
            c.isWorking = false
        })
    }
    ;
    c.getBadges = function() {
        h.post("/user/view/badges", {
            userId: c.userData.userId
        }).success(function(l) {
            l.sort(function k(m, i) {
                if (m.imageLocation < i.imageLocation) {
                    return -1
                }
                if (m.imageLocation > i.imageLocation) {
                    return 1
                }
                return 0
            });
            for (var j = 0; j < l.length; j++) {
                l[j].percentage = Math.floor(l[j].currentValue * 100 / l[j].maximumValue)
            }
            c.badges.data = l
        }).error(function(i) {
            console.log("error: " + i)
        })
    }
    ;
    c.mentorship.mentor.plagiarism.viewSubmissionDetails = function(k, l, i, j) {
        h.post("/submission/mentorship/mentor/plagiarism/view/submission", {
            sub1: k,
            menteeUserId1: l,
            sub2: i,
            menteeUserId2: j
        }).success(function(m) {
            c.mentorship.mentor.plagiarism.modalSub = m;
            c.mentorship.mentor.plagiarism.modalSubList = [];
            c.mentorship.mentor.plagiarism.modalSubList.push(k);
            c.mentorship.mentor.plagiarism.modalSubList.push(i);
            c.mentorship.mentor.plagiarism.openModalSubmission = true;
            setTimeout(function() {
                Prism.highlightAll()
            }, 10)
        }).error(function(m) {
            console.log(m)
        })
    }
    ;
    c.mentorship.mentor.plagiarism.detectPlagiarism = function() {
        var j = c.mentorship.mentor.plagiarism.activeMentee;
        var k = [];
        if (c.mentorship.showGroup[-1] === true) {
            k.push(-1)
        } else {
            for (var m = 0; m < c.mentorship.groupData.length; m++) {
                var n = c.mentorship.groupData[m].mentorshipGroupId;
                if (c.mentorship.showGroup[n] === true) {
                    k.push(n)
                }
            }
        }
        var l = new FormData();
        l.append("mentorshipGroupId", k);
        l.append("menteeUsername", j);
        $.ajax({
            url: "/submission/mentorship/mentor/plagiarism",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: l,
            success: function(i) {
                c.$apply(function() {
                    c.mentorship.mentor.plagiarism.highestPercentage = {};
                    c.mentorship.mentor.plagiarism.plagiarismResultData = {};
                    for (var q in i) {
                        if (i.hasOwnProperty(q)) {
                            var o = i[q];
                            var r = {};
                            c.mentorship.mentor.plagiarism.highestPercentage[q] = 0;
                            for (var p = 0; p < o.length; p++) {
                                r[o[p].problemId] = o[p];
                                if (c.mentorship.mentor.plagiarism.highestPercentage[q] < o[p].similarityPercentage) {
                                    c.mentorship.mentor.plagiarism.highestPercentage[q] = o[p].similarityPercentage
                                }
                            }
                            c.mentorship.mentor.plagiarism.plagiarismResultData[q] = r
                        }
                    }
                    c.mentorship.mentor.plagiarism.plagiarismResultData = i
                })
            },
            error: function(i) {
                console.log(i)
            }
        })
    }
    ;
    c.mentorship.mentor.plagiarism.waitForFinalEventGetMenteeList = function() {
        if (c.mentorship.mentor.currentPage === "plagiarism") {
            c.waitForFinalEvent(function() {
                c.mentorship.mentor.plagiarism.getMenteeList()
            }, 750, "get plagiarism mentee list")
        }
    }
    ;
    c.mentorship.mentor.plagiarism.getMenteeList = function() {
        var j = [];
        if (c.mentorship.showGroup[-1] === true) {
            j.push(-1)
        } else {
            for (var l = 0; l < c.mentorship.groupData.length; l++) {
                var m = c.mentorship.groupData[l].mentorshipGroupId;
                if (c.mentorship.showGroup[m] === true) {
                    j.push(m)
                }
            }
        }
        var k = new FormData();
        k.append("mentorshipGroupId", j);
        $.ajax({
            url: "/submission/mentorship/mentor/mentee_list",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: k,
            success: function(i) {
                c.$apply(function() {
                    if (i === "" || i === null  || i === undefined) {
                        c.mentorship.mentor.plagiarism.menteeList = []
                    } else {
                        i.sort(function n(p, o) {
                            if (p < o) {
                                return -1
                            }
                            if (o < p) {
                                return 1
                            }
                            return 0
                        });
                        c.mentorship.mentor.plagiarism.menteeList = i
                    }
                })
            },
            error: function(i) {
                console.log(i)
            }
        })
    }
    ;
    c.mentorship.mentor.waitForFinalEventGetSubmissionStatistic = function() {
        if (c.mentorship.mentor.currentPage === "statistic") {
            c.waitForFinalEvent(function() {
                c.mentorship.mentor.getSubmissionStatistic();
                c.mentorship.mentor.getDistinctAcceptedProblem();
                c.mentorship.mentor.getRatingStatistic()
            }, 750, "get submission statistic")
        }
    }
    ;
    c.mentorship.mentor.refreshSubmissionStatisticChart = function(i) {
        if (google.visualization !== undefined) {
            if (c.mentorship.mentor.submissionStatisticChart[i] === undefined || c.mentorship.mentor.submissionStatisticChart[i] === null  || c.mentorship.mentor.submissionStatisticChart[i] === "") {
                if ($("#submissionStatisticChart" + i).length != 0) {
                    c.mentorship.mentor.submissionStatisticChart[i] = new google.visualization.ColumnChart(document.getElementById("submissionStatisticChart" + i))
                }
            }
            if (c.mentorship.mentor.submissionStatisticData[i] !== undefined && c.mentorship.mentor.submissionStatisticData[i] !== null  && c.mentorship.mentor.submissionStatisticData[i] !== "") {
                c.mentorship.mentor.submissionStatisticChart[i].draw(google.visualization.arrayToDataTable(c.mentorship.mentor.submissionStatisticData[i]), c.globalChartOptions)
            }
        }
    }
    ;
    c.mentorship.mentor.getSubmissionStatistic = function() {
        var j = [];
        for (var l = 0; l < c.mentorship.slotData.length; l++) {
            var m = c.mentorship.slotData[l].mentorshipSlotId;
            if (c.mentorship.showSlot[m] === true) {
                j.push(m)
            }
        }
        var k = new FormData();
        k.append("mentorshipSlotId", j);
        $.ajax({
            url: "/submission/mentorship/mentor/statistic",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: k,
            success: function(i) {
                c.$apply(function() {
                    if (i === null  || i === "" || i === undefined) {
                        return
                    }
                    var s = [["Username", "Accepted", {
                        role: "style"
                    }, "Compile Error", {
                        role: "style"
                    }, "Memory Limit Exceeded", {
                        role: "style"
                    }, "Run Time Error", {
                        role: "style"
                    }, "Submission Error", {
                        role: "style"
                    }, "Time Limit Exceeded", {
                        role: "style"
                    }, "Wrong Answer", {
                        role: "style"
                    }]];
                    var t = 1;
                    var n = 0;
                    for (var v in i) {
                        if (i.hasOwnProperty(v)) {
                            var q = i[v];
                            var o = [];
                            o.push(v);
                            for (var p = 0; p < 14; p++) {
                                if (p & 1) {
                                    o.push("")
                                } else {
                                    o.push(0)
                                }
                            }
                            for (var p = 0; p < q.length; p++) {
                                var u = q[p];
                                var r = -1;
                                if (u.verdictDisplayName === "Accepted") {
                                    r = 1
                                } else {
                                    if (u.verdictDisplayName === "Compile Error") {
                                        r = 3
                                    } else {
                                        if (u.verdictDisplayName === "Memory Limit Exceeded") {
                                            r = 5
                                        } else {
                                            if (u.verdictDisplayName === "Run Time Error") {
                                                r = 7
                                            } else {
                                                if (u.verdictDisplayName === "Submission Error") {
                                                    r = 9
                                                } else {
                                                    if (u.verdictDisplayName === "Time Limit Exceeded") {
                                                        r = 11
                                                    } else {
                                                        if (u.verdictDisplayName === "Wrong Answer") {
                                                            r = 13
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (r === -1) {
                                    continue
                                }
                                o[r] = u.count;
                                o[r + 1] = "fill-opacity:0.65; color:" + u.verdictColor
                            }
                            s.push(o);
                            n++;
                            if (n === 5) {
                                n = 0;
                                c.mentorship.mentor.submissionStatisticData[t] = s;
                                document.getElementById("submissionStatisticChart" + t).style.display = "block";
                                c.mentorship.mentor.refreshSubmissionStatisticChart(t);
                                s = [["Username", "Accepted", {
                                    role: "style"
                                }, "Compile Error", {
                                    role: "style"
                                }, "Memory Limit Exceeded", {
                                    role: "style"
                                }, "Run Time Error", {
                                    role: "style"
                                }, "Submission Error", {
                                    role: "style"
                                }, "Time Limit Exceeded", {
                                    role: "style"
                                }, "Wrong Answer", {
                                    role: "style"
                                }]];
                                t++
                            }
                        }
                    }
                    if (n != 0) {
                        c.mentorship.mentor.submissionStatisticData[t] = s;
                        document.getElementById("submissionStatisticChart" + t).style.display = "block";
                        c.mentorship.mentor.refreshSubmissionStatisticChart(t);
                        t++
                    }
                    for (var p = t; p <= 4; p++) {
                        document.getElementById("submissionStatisticChart" + p).style.display = "none"
                    }
                })
            },
            error: function(i) {
                console.log(i)
            }
        })
    }
    ;
    c.mentorship.mentor.loadAllChart = function() {
        google.load("visualization", "1", {
            packages: ["corechart", "line"],
            callback: function() {
                c.mentorship.mentor.getSubmissionStatistic();
                c.mentorship.mentor.getRatingStatistic();
                $(window).off("resize");
                $(window).resize(function() {
                    c.waitForFinalEvent(function() {
                        for (var j = 1; j <= 4; j++) {
                            c.mentorship.mentor.refreshSubmissionStatisticChart(j)
                        }
                        c.refreshRatingStatisticChart()
                    }, 100, "refresh submission statistic chart")
                })
            }
        })
    }
    ;
    c.mentorship.mentor.getRatingStatistic = function() {
        var l = [];
        for (var k = 0; k < c.mentorship.slotData.length; k++) {
            var m = c.mentorship.slotData[k].mentorshipSlotId;
            if (c.mentorship.showSlot[m] === true) {
                l.push(m)
            }
        }
        var j = new FormData();
        j.append("mentorshipSlotId", l);
        $.ajax({
            url: "/user/mentorship/mentor/rating",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: j,
            success: function(i) {
                if (i === null  || i === "" || i === undefined || i.length <= 0) {
                    return
                }
                c.$apply(function() {
                    c.ratingStatisticRawData = {};
                    for (var v = 0; v < i.length; v++) {
                        var A = i[v];
                        c.ratingStatisticRawData[A[0].username] = A
                    }
                    var x = new google.visualization.DataTable();
                    var w = {};
                    var t = [];
                    var o = [];
                    x.addColumn("date", "Contest End Time");
                    for (var y in c.ratingStatisticRawData) {
                        if (c.ratingStatisticRawData.hasOwnProperty(y)) {
                            var s = c.ratingStatisticRawData[y];
                            for (var r = 0; r < s.length; r++) {
                                if (r == 0) {
                                    x.addColumn("number", s[r].username);
                                    x.addColumn({
                                        type: "string",
                                        role: "tooltip",
                                        p: {
                                            html: true
                                        }
                                    });
                                    t.push(s[r].username)
                                }
                                if (w[s[r].contestEndTime] === undefined) {
                                    w[s[r].contestEndTime] = {};
                                    o.push(s[r].contestEndTime)
                                }
                                w[s[r].contestEndTime][s[r].username] = s[r]
                            }
                        }
                    }
                    o.sort();
                    for (var v = 0; v < o.length; v++) {
                        var y = o[v];
                        var q = [];
                        if (w.hasOwnProperty(y)) {
                            var s = w[y];
                            q.push(new Date(parseInt(y)));
                            for (var r = 0; r < t.length; r++) {
                                var B = t[r];
                                if (w[y][B] !== undefined) {
                                    var u = w[y][B];
                                    var n = w[y][B].changes;
                                    if (n > 0) {
                                        n = "+" + n
                                    }
                                    q.push(u.newRating);
                                    var p = "<div style='padding:10px;'><a href='/user/contest/" + u.contestId + "/about' style='color:black; white-space:nowrap; font-weight:bold; text-decoration:none;' target='_blank'>" + u.contestTitle + "<br>" + u.username + ": " + u.newRating + " <span style='color:" + ((n > 0) ? ("green") : ((n < 0) ? ("red") : ("black"))) + "'>(" + n + ")</span></a></div>";
                                    q.push(p)
                                } else {
                                    q.push(null );
                                    q.push(null )
                                }
                            }
                        }
                        x.addRow(q)
                    }
                    c.ratingStatisticData = x;
                    c.refreshRatingStatisticChart()
                })
            },
            error: function(i) {
                console.log(i)
            }
        })
    }
    ;
    c.mentorship.mentor.getDistinctAcceptedProblem = function() {
        var j = [];
        for (var l = 0; l < c.mentorship.slotData.length; l++) {
            var m = c.mentorship.slotData[l].mentorshipSlotId;
            if (c.mentorship.showSlot[m] === true) {
                j.push(m)
            }
        }
        var k = new FormData();
        k.append("mentorshipSlotId", j);
        $.ajax({
            url: "/submission/mentorship/mentor/dacp",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: k,
            success: function(i) {
                if (i === null  || i === "" || i === undefined) {
                    return
                }
                c.$apply(function() {
                    c.mentorship.mentor.dacpUsernameList = [];
                    for (key in i) {
                        if (i.hasOwnProperty(key)) {
                            i[key].sort(function n(p, o) {
                                if (parseInt(p) < parseInt(o)) {
                                    return -1
                                }
                                if (parseInt(p) > parseInt(o)) {
                                    return 1
                                }
                                return 0
                            })
                        }
                        c.mentorship.mentor.dacpUsernameList.push(key)
                    }
                    c.mentorship.mentor.dacpData = i
                })
            },
            error: function(i) {
                console.log(i)
            }
        })
    }
    ;
    c.mentorship.mentor.changePage = function(i) {
        c.mentorship.mentor.currentPage = i
    }
    ;
    c.mentorship.mentee.getMentor = function() {
        h.post("/user/mentorship/mentee/mentor/get").success(function(i) {
            c.mentorship.mentee.dataMentor = i
        }).error(function(i) {
            console.log("error");
            console.log(i)
        })
    }
    ;
    c.mentorship.mentee.acceptMentor = function(i) {
        c.mentorship.mentee.dataMentor[i].isWorking = true;
        h.post("/user/mentorship/mentee/mentor/accept", {
            mentorshipSlotId: c.mentorship.mentee.dataMentor[i].mentorshipSlotId
        }).success(function(j) {
            if (j === true) {
                c.mentorship.mentee.dataMentor[i].isActive = true;
                if (c.mentorship.mentee.showMentor[c.mentorship.mentee.dataMentor[i].mentorshipSlotId] === true) {
                    c.mentorship.mentee.getExercise()
                }
            }
            c.mentorship.mentee.dataMentor[i].isWorking = true
        }).error(function(j) {
            console.log("error");
            console.log(j);
            c.mentorship.mentee.dataMentor[i].isWorking = true
        })
    }
    ;
    c.mentorship.mentee.waitForFinalEventGetExercise = function() {
        c.waitForFinalEvent(function() {
            c.mentorship.mentee.getExercise()
        }, 750, "get mentee exercise")
    }
    ;
    c.mentorship.mentee.getExercise = function() {
        var k = new FormData();
        var l = [];
        if (c.mentorship.mentee.dataMentor !== undefined) {
            for (var j = 0; j < c.mentorship.mentee.dataMentor.length; j++) {
                var m = c.mentorship.mentee.dataMentor[j].mentorshipSlotId;
                if (c.mentorship.mentee.showMentor[m] === true) {
                    l.push(m)
                }
            }
        }
        k.append("mentorshipSlotId", l);
        $.ajax({
            url: "/user/mentorship/mentee/exercise/get",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: k,
            success: function(i) {
                c.$apply(function() {
                    c.mentorship.mentee.dataExercise = i
                })
            },
            error: function(i) {
                console.log("error: " + i)
            }
        })
    }
    ;
    c.mentorship.changePage = function(i) {
        c.mentorship.currentPage = i
    }
    ;
    c.mentorship.generateSlotPageArray = function() {
        c.mentorship.slotTotalPage = Math.ceil(c.mentorship.slotActiveCount / c.mentorship.slotPerPage);
        c.mentorship.slotPages = d.getPageArr(c.mentorship.slotPage, c.mentorship.slotTotalPage);
        c.mentorship.showSlot[-1] = false
    }
    ;
    c.mentorship.slotPrevPage = function() {
        if (c.mentorship.slotPage > 1) {
            c.mentorship.slotPage--
        }
        c.mentorship.getMentorshipSlot()
    }
    ;
    c.mentorship.slotNextPage = function() {
        if (c.mentorship.slotPage < c.mentorship.slotTotalPage) {
            c.mentorship.slotPage++
        }
        c.mentorship.getMentorshipSlot()
    }
    ;
    c.mentorship.refreshSlotPageArray = function() {
        if (c.mentorship.showGroup[-1] === true) {
            c.mentorship.slotActiveCount = c.mentorship.allSlotCount;
            c.mentorship.generateSlotPageArray()
        } else {
            c.mentorship.slotActiveCount = 0;
            for (var j = 0; j < c.mentorship.groupData.length; j++) {
                if (c.mentorship.showGroup[c.mentorship.groupData[j].mentorshipGroupId] === true) {
                    c.mentorship.slotActiveCount += c.mentorship.groupData[j].count
                }
            }
            c.mentorship.generateSlotPageArray()
        }
    }
    ;
    c.mentorship.buySlot = function() {
        c.mentorship.buySlotData.isWorking = true;
        var i = new FormData();
        i.append("amount", c.mentorship.buySlotData.numberOfSlots);
        i.append("month", c.mentorship.buySlotData.duration);
        $.ajax({
            url: "/user/mentorship/slot/buy",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: i,
            success: function(j) {
                c.$apply(function() {
                    if (j === "Success") {
                        j = "Success, please refresh the page to view changes."
                    }
                    c.mentorship.buySlotData.msg = j;
                    c.mentorship.buySlotData.isWorking = false
                })
            },
            error: function(j) {
                console.log("error: " + j);
                c.$apply(function() {
                    c.mentorship.buySlotData.isWorking = false
                })
            }
        })
    }
    ;
    c.mentorship.renewSlot = function() {
        c.mentorship.renewSlotData.isWorking = true;
        var l = new FormData();
        l.append("month", c.mentorship.renewSlotData.duration);
        var j = [];
        if (c.mentorship.renewSlotData.source === "all slots") {
            j.push(-1)
        } else {
            for (var k = 0; k < c.mentorship.slotData.length; k++) {
                var m = c.mentorship.slotData[k].mentorshipSlotId;
                if (c.mentorship.showSlot[m] === true && c.mentorship.slotData[k].status === "Locked") {
                    j.push(m)
                }
            }
        }
        l.append("mentorshipSlotId", j);
        $.ajax({
            url: "/user/mentorship/slot/renew",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: l,
            success: function(i) {
                c.$apply(function() {
                    if (i === "Success") {
                        i = "Success, please refresh the page to view changes."
                    }
                    c.mentorship.renewSlotData.msg = i;
                    c.mentorship.renewSlotData.isWorking = false
                })
            },
            error: function(i) {
                console.log("error");
                console.log(i);
                c.mentorship.renewSlotData.isWorking = false
            }
        })
    }
    ;
    c.mentorship.renewSlotData.refreshLockedCount = function() {
        if (c.mentorship.renewSlotData.source === "all slots") {
            h.post("/user/mentorship/slot/count/locked").success(function(i) {
                c.mentorship.renewSlotData.lockedCount = i
            }).error(function(i) {
                console.log("error");
                console.log(i)
            })
        } else {
            c.mentorship.renewSlotData.lockedCount = 0;
            for (var j = 0; j < c.mentorship.slotData.length; j++) {
                var k = c.mentorship.slotData[j].mentorshipSlotId;
                if (c.mentorship.showSlot[k] === true && c.mentorship.slotData[j].status === "Locked") {
                    c.mentorship.renewSlotData.lockedCount++
                }
            }
        }
    }
    ;
    c.mentorship.waitForFinalEventGetMentorshipExercise = function() {
        c.waitForFinalEvent(function() {
            c.mentorship.getMentorshipExercise()
        }, 750, "get mentorship exercise")
    }
    ;
    c.mentorship.getMentorshipExercise = function() {
        var l = [];
        if (c.mentorship.showGroup[-1] === true) {
            l.push(-1)
        } else {
            for (var k = 0; k < c.mentorship.groupData.length; k++) {
                var m = c.mentorship.groupData[k].mentorshipGroupId;
                if (c.mentorship.showGroup[m] === true) {
                    l.push(m)
                }
            }
        }
        var j = new FormData();
        j.append("mentorshipGroupId", l);
        $.ajax({
            url: "/user/mentorship/exercise/get",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: j,
            success: function(i) {
                c.$apply(function() {
                    if (i !== "" && i != null  && i !== undefined) {
                        i.sort(function o(q, p) {
                            if (q.problemId < p.problemId) {
                                return -1
                            }
                            if (q.problemId > p.problemId) {
                                return 1
                            }
                            return 0
                        })
                    }
                    c.mentorship.exerciseData = i;
                    c.mentorship.mentor.isExerciseDataAvailable = {};
                    for (var n = 0; n < i.length; n++) {
                        c.mentorship.mentor.isExerciseDataAvailable[i[n].problemId] = true
                    }
                })
            },
            error: function(i) {
                console.log("error");
                console.log(i)
            }
        })
    }
    ;
    c.mentorship.addExercise = function() {
        var m = [];
        if (c.mentorship.showGroup[-1] === true) {
            for (var k = 0; k < c.mentorship.groupData.length; k++) {
                m.push(c.mentorship.groupData[k].mentorshipGroupId)
            }
        } else {
            for (var k = 0; k < c.mentorship.groupData.length; k++) {
                var n = c.mentorship.groupData[k].mentorshipGroupId;
                if (c.mentorship.showGroup[n] === true) {
                    m.push(n)
                }
            }
        }
        var l = c.mentorship.addExerciseData.problemId.split(/[ ,]+/);
        var j = new FormData();
        j.append("mentorshipGroupId", m);
        j.append("problemId", l);
        $.ajax({
            url: "/user/mentorship/exercise/add",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: j,
            success: function(i) {
                c.$apply(function() {
                    if (i === "Success") {
                        c.mentorship.getMentorshipExercise()
                    }
                    c.mentorship.addExerciseData.msg = i
                })
            },
            error: function(i) {
                console.log("error");
                console.log(i)
            }
        })
    }
    ;
    c.mentorship.deleteMentorshipExercise = function(j) {
        var m = [];
        if (c.mentorship.showGroup[-1] === true) {
            m.push(-1)
        } else {
            for (var l = 0; l < c.mentorship.groupData.length; l++) {
                var n = c.mentorship.groupData[l].mentorshipGroupId;
                if (c.mentorship.showGroup[n] === true) {
                    m.push(n)
                }
            }
        }
        var k = new FormData();
        k.append("mentorshipGroupId", m);
        k.append("problemId", c.mentorship.exerciseData[j].problemId);
        $.ajax({
            url: "/user/mentorship/exercise/delete",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: k,
            success: function(i) {
                c.$apply(function() {
                    if (i === "Success") {
                        c.mentorship.exerciseData.splice(j, 1)
                    }
                })
            },
            error: function(i) {
                console.log("error");
                console.log(i)
            }
        })
    }
    ;
    c.mentorship.populateSlotPage = function(i) {
        if (isNaN(i)) {
            return
        }
        c.mentorship.slotPage = i;
        c.mentorship.getMentorshipSlot()
    }
    ;
    c.mentorship.changeAllShowSlot = function() {
        for (var i in c.mentorship.showSlot) {
            if (c.mentorship.showSlot.hasOwnProperty(i)) {
                c.mentorship.showSlot[i] = c.mentorship.showSlot[-1]
            }
        }
    }
    ;
    c.mentorship.changeSlotSort = function(i) {
        if (c.mentorship.slotSortColumn === i) {
            if (c.mentorship.slotSortOrder === "ASC") {
                c.mentorship.slotSortOrder = "DESC"
            } else {
                c.mentorship.slotSortOrder = "ASC"
            }
        } else {
            c.mentorship.slotSortColumn = i;
            c.mentorship.slotSortOrder = "ASC"
        }
        c.mentorship.getMentorshipSlot()
    }
    ;
    c.mentorship.waitForFinalEventGetMentorshipSlot = function() {
        c.waitForFinalEvent(function() {
            c.mentorship.getMentorshipSlot()
        }, 750, "get mentorship slot")
    }
    ;
    c.mentorship.getMentorshipSlot = function() {
        var i = [];
        for (var j in c.mentorship.showGroup) {
            if (c.mentorship.showGroup.hasOwnProperty(j)) {
                if (c.mentorship.showGroup[j] === true) {
                    i.push(j)
                }
            }
        }
        i.sort(function m(n, k) {
            if (n > k) {
                return 1
            }
            if (n < k) {
                return -1
            }
            return 0
        });
        var l = new FormData();
        l.append("mentorshipGroupId", i);
        l.append("sortColumn", c.mentorship.slotSortColumn);
        l.append("sortOrder", c.mentorship.slotSortOrder);
        l.append("pageNumber", c.mentorship.slotPage);
        $.ajax({
            url: "/user/mentorship/slot",
            method: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: l,
            success: function(k) {
                c.$apply(function() {
                    c.mentorship.slotData = k;
                    c.mentorship.refreshSlotPageArray()
                })
            },
            error: function(k) {
                console.log("error: " + k)
            }
        })
    }
    ;
    c.mentorship.editMentorshipSlot = function() {
        c.mentorship.editSlotData.isWorking = true;
        var j = c.mentorship.editSlotData.mentorshipSlotId;
        var i = c.mentorship.editSlotData.mentorshipGroupId;
        var k = c.mentorship.editSlotData.menteeUsername;
        h.post("/user/mentorship/slot/edit", {
            mentorshipSlotId: j,
            mentorshipGroupId: i,
            menteeUsername: k
        }).success(function(m) {
            if (m != "" && m != null  && m.mentorshipSlotId !== undefined && !isNaN(m.mentorshipSlotId)) {
                for (var l = 0; l < c.mentorship.slotData.length; l++) {
                    if (c.mentorship.slotData[l].mentorshipSlotId === j) {
                        c.mentorship.slotData[l] = m;
                        break
                    }
                }
                c.mentorship.editSlotData.msg = "Success"
            } else {
                c.mentorship.editSlotData.msg = "Failed"
            }
            c.mentorship.editSlotData.isWorking = false
        }).error(function(l) {
            console.log("error: " + l);
            c.mentorship.editSlotData.msg = "Failed";
            c.mentorship.editSlotData.isWorking = false
        })
    }
    ;
    c.mentorship.getMentorshipGroup = function() {
        h.post("/user/mentorship/slot/count").success(function(i) {
            c.mentorship.allSlotCount = i;
            c.mentorship.slotActiveCount = i;
            c.mentorship.generateSlotPageArray()
        }).error(function(i) {
            console.log("error: " + i)
        });
        h.post("/user/mentorship/group").success(function(k) {
            c.mentorship.groupData = k;
            for (var j = 0; j < k.length; j++) {
                c.mentorship.groupName[c.mentorship.groupData[j].mentorshipGroupId] = c.mentorship.groupData[j].name
            }
        }).error(function(i) {
            console.log("error: " + i)
        })
    }
    ;
    c.mentorship.addMentorshipGroup = function() {
        if (c.mentorship.addGroupData.name.length > 15) {
            c.mentorship.addGroupData.msg = "Max. 15 characters"
        }
        c.mentorship.addGroupData.isWorking = true;
        c.mentorship.addGroupData.msg = "Processing...";
        h.post("/user/mentorship/group/add", c.mentorship.addGroupData).success(function(i) {
            if (i !== null  && i) {
                c.mentorship.groupData.push({
                    name: c.mentorship.addGroupData.name,
                    mentorshipGroupId: i,
                    count: 0
                });
                c.mentorship.groupName[i] = c.mentorship.addGroupData.name;
                c.mentorship.addGroupData = {};
                c.mentorship.addGroupData.msg = "Success"
            } else {
                c.mentorship.addGroupData.msg = "Failed"
            }
            c.mentorship.addGroupData.isWorking = false
        }).error(function(i) {
            console.log("error: " + i);
            c.mentorship.addGroupData.isWorking = false;
            c.mentorship.addGroupData.msg = "Failed"
        })
    }
    ;
    c.mentorship.editMentorshipGroup = function() {
        if (c.mentorship.editGroupData.name.length > 15) {
            c.mentorship.editGroupData.msg = "Max. 15 characters"
        }
        c.mentorship.editGroupData.isWorking = true;
        c.mentorship.editGroupData.msg = "Processing...";
        h.post("/user/mentorship/group/edit", c.mentorship.editGroupData).success(function(k) {
            if (k !== null  && k) {
                for (var j = 0; j < c.mentorship.groupData.length; j++) {
                    if (c.mentorship.groupData[j].mentorshipGroupId === c.mentorship.editGroupData.mentorshipGroupId) {
                        c.mentorship.groupData[j].name = c.mentorship.editGroupData.name;
                        c.mentorship.groupName[c.mentorship.groupData[j].mentorshipGroupId] = c.mentorship.groupData[j].name;
                        break
                    }
                }
                c.mentorship.editGroupData.msg = "Success"
            } else {
                c.mentorship.editGroupData.msg = "Failed"
            }
            c.mentorship.editGroupData.isWorking = false
        }).error(function(i) {
            console.log("error: " + i);
            c.mentorship.editGroupData.isWorking = false;
            c.mentorship.editGroupData.msg = "Failed"
        })
    }
    ;
    c.mentorship.deleteMentorshipGroup = function(i) {
        h.post("/user/mentorship/group/delete", {
            mentorshipGroupId: c.mentorship.groupData[i].mentorshipGroupId
        }).success(function(j) {
            if (j === true) {
                c.mentorship.groupName[c.mentorship.groupData[i].mentorshipGroupId] = null ;
                c.mentorship.groupData.splice(i, 1)
            }
        }).error(function(j) {
            console.log("error: " + j)
        })
    }
    ;
    c.getUserCount = function(i) {
        h.post("/user/count").success(function(j) {
            c.userCount = j;
            if (i) {
                i()
            }
        })
    }
    ;
    c.rank.generatePageArray = function() {
        c.rank.totalPage = Math.ceil(c.userCount / c.rank.rankPerPage);
        c.rank.pages = d.getPageArr(c.rank.currentPageNumber, c.rank.totalPage)
    }
    ;
    c.rank.populateData = function() {
        h.post("/user/rank/" + c.rank.currentPage, {
            pageNumber: c.rank.currentPageNumber
        }).success(function(i) {
            c.rank.data = i
        }).error(function(i) {
            console.log("error: " + i)
        })
    }
    ;
    c.rank.prevPageNumber = function() {
        if (c.rank.currentPageNumber > 1) {
            c.rank.currentPageNumber--
        }
        c.rank.generatePageArray();
        c.rank.populateData()
    }
    ;
    c.rank.nextPageNumber = function() {
        if (c.rank.currentPageNumber < c.rank.totalPage) {
            c.rank.currentPageNumber++
        }
        c.rank.generatePageArray();
        c.rank.populateData()
    }
    ;
    c.rank.changePageNumber = function(i) {
        if (isNaN(i)) {
            return
        }
        c.rank.currentPageNumber = i;
        c.rank.generatePageArray();
        c.rank.populateData()
    }
    ;
    c.rank.changePage = function(i) {
        c.rank.currentPage = i;
        c.rank.populateData()
    }
    ;
    c.getUserNotification = function() {
        h.post("/user/notification/get").success(function(l) {
            var j = {};
            j.items = l;
            j.unread = 0;
            j.maxNotificationTime = 0;
            j.viewNotificationTime = d.getCookie("view_notification_time_" + c.userDataShared.userId);
            if (isNaN(j.viewNotificationTime)) {
                j.viewNotificationTime = -1
            }
            if (l !== null  && l !== undefined && l !== "null" && l !== "undefined" && l !== "" && l.length > 0) {
                for (var k = 0; k < l.length; k++) {
                    j.maxNotificationTime = Math.max(j.maxNotificationTime, l[k].notificationTime);
                    if (l[k].isRead === false) {
                        if (l[k].notificationTime > j.viewNotificationTime) {
                            j.unread++
                        }
                    }
                }
            }
            f.setNotification(j)
        }).error(function(i) {
            console.log("error:" + i)
        })
    }
    ;
    c.markUserNotification = function(i) {
        if (c.notification.items[i].isRead === true) {
            return
        }
        h.post("/user/notification/mark", {
            notificationId: c.notification.items[i].notificationId
        }).success(function(j) {
            c.notification.items[i].isRead = true;
            c.notification.unread--
        }).error(function(j) {
            console.log("error:" + j)
        })
    }
    ;
    c.setViewNotificationTime = function() {
        d.setCookie("view_notification_time_" + c.userDataShared.userId, c.notification.maxNotificationTime, 30 * 24 * 60 * 60 * 1000, "");
        c.notification.unread = 0
    }
    ;
    c.notificationRedirect = function(i) {
        g.path(i)
    }
    ;
    c.getAutocompleteUsername = function(i) {
        return h.post("/user/autocomplete", {
            pattern: i
        }).then(function(j) {
            return j.data
        })
    }
    ;
    c.searchUsername = function() {
        if ($("#searchUsernameInput").val().length >= 3) {
            g.path("/user/view/" + $("#searchUsernameInput").val())
        }
    }
    ;
    $("#searchUsernameInput").keyup(function(i) {
        if (i.keyCode === 13) {
            c.searchUsername()
        }
    });
    $("#compareStatisticWithUsernameInput").keyup(function(i) {
        if (i.keyCode === 13 && $("#compareStatisticWithUsernameInput").val() !== "" && !c.isWorking) {
            c.$apply(function() {
                c.addCompareStatisticUsername()
            })
        }
    });
    c.addCompareStatisticUsername = function() {
        var j = $("#compareStatisticWithUsernameInput").val();
        if (j === "" || j === undefined || j === null ) {
            return
        }
        if (j === e.username) {
            c.statisticMsg = "Username already exists in chart"
        }
        if (c.submissionStatisticData === undefined) {
            c.statisticMsg = "No statistic to be compared";
            return
        }
        $("#compareStatisticWithUsernameInput").val("");
        c.isWorking = true;
        c.statisticMsg = "";
        if (c.compareStatisticUsernameList.indexOf(j) === -1) {
            var i = false;
            b.all([h.post("/submission/statistic/user/u/" + j).success(function(k) {
                if (k === null  || k === "" || k === undefined || k.length === 0) {
                    return
                } else {
                    i = true;
                    c.updateSubmissionStatisticChart(j, k, null )
                }
            }).error(function(k) {
                console.log("Error: " + k);
                c.isWorking = false
            }), h.post("/user/statistic/rating", {
                username: j
            }).success(function(k) {
                if (k !== null  && k !== "" && k !== undefined && k.length !== 0) {
                    i = true;
                    c.updateRatingStatisticChart(j, k, null )
                }
            }).error(function(k) {
                console.log(k)
            })]).then(function() {
                if (i) {
                    c.compareStatisticUsernameList.push(j)
                } else {
                    c.statisticMsg = "Username does not exists or no statistic to be displayed"
                }
                c.isWorking = false
            })
        } else {
            c.statisticMsg = "Username already exists in comparison list";
            c.isWorking = false
        }
    }
    ;
    c.deleteCompareStatisticUsername = function(i) {
        c.updateSubmissionStatisticChart(null , null , c.compareStatisticUsernameList[i]);
        c.updateRatingStatisticChart(null , null , c.compareStatisticUsernameList[i]);
        c.compareStatisticUsernameList.splice(i, 1)
    }
    ;
    c.loadAllCharts = function() {
        google.load("visualization", "1", {
            packages: ["corechart", "line"],
            callback: function() {
                c.getSubmissionStatistic();
                c.getRatingStatistic();
                $(window).off("resize");
                $(window).resize(function() {
                    c.waitForFinalEvent(function() {
                        c.refreshSubmissionStatisticChart();
                        c.refreshRatingStatisticChart()
                    }, 100, "refresh submission statistic chart")
                })
            }
        })
    }
    ;
    c.getSubmissionStatistic = function() {
        var i = e.username;
        h.post("/submission/statistic/user/u/" + i).success(function(l) {
            if (l !== null  && l !== undefined && l !== "" && l.length) {
                var j = [["Verdict", c.userData.username, {
                    role: "style"
                }]];
                for (var k = 0; k < l.length; k++) {
                    j.push([l[k].verdictDisplayName, l[k].count, "fill-opacity:0.65; color:" + l[k].verdictColor])
                }
                c.submissionStatisticData = j;
                c.refreshSubmissionStatisticChart()
            }
        }).error(function(j) {
            console.log("error:" + j)
        })
    }
    ;
    c.getRatingStatistic = function() {
        var i = e.username;
        h.post("/user/statistic/rating", {
            username: i
        }).success(function(n) {
            if (n !== null  && n !== undefined && n !== "" && n.length > 0) {
                if (c.ratingStatisticRawData === undefined) {
                    c.ratingStatisticRawData = {}
                }
                c.ratingStatisticRawData[n[0].username] = n;
                var k = new google.visualization.DataTable();
                k.addColumn("date", "Contest End Time");
                k.addColumn("number", i);
                k.addColumn({
                    type: "string",
                    role: "tooltip",
                    p: {
                        html: true
                    }
                });
                var l = [];
                for (var m = 0; m < n.length; m++) {
                    var p = n[m];
                    var o = p.changes;
                    if (o > 0) {
                        o = "+" + o
                    }
                    var j = "<div style='padding:10px;'><a href='/user/contest/" + p.contestId + "/about' style='color:black; white-space:nowrap; font-weight:bold; text-decoration:none;' target='_blank'>" + p.contestTitle + "<br>" + p.username + ": " + p.newRating + " <span style='color:" + ((o > 0) ? ("green") : ((o < 0) ? ("red") : ("black"))) + "'>(" + o + ")</span></a></div>";
                    l.push([new Date(p.contestEndTime), p.newRating, j])
                }
                k.addRows(l);
                c.ratingStatisticData = k;
                c.refreshRatingStatisticChart()
            }
        }).error(function(j) {
            console.log(j)
        })
    }
    ;
    c.updateSubmissionStatisticChart = function(l, p, u) {
        if (l !== null  && l !== "" && l !== undefined && p !== null  && p !== "" && p !== undefined) {
            var s = c.submissionStatisticData;
            if (s instanceof Array) {
                s[0].push(l);
                s[0].push({
                    role: "style"
                });
                for (var q = 1; q < s.length; q++) {
                    var r = false;
                    for (var o = 0; o < p.length; o++) {
                        if (s[q][0] === p[o].verdictDisplayName) {
                            r = true;
                            s[q].push(p[o].count);
                            s[q].push(s[q][2]);
                            p.splice(o, 1);
                            break
                        }
                    }
                    if (!r) {
                        s[q].push(0);
                        s[q].push(s[q][2])
                    }
                }
                for (var o = 0; o < p.length; o++) {
                    var m = [];
                    m.push(p[o].verdictDisplayName);
                    for (var n = 0; n < s[0].length - 3; n++) {
                        if (n % 2 == 0) {
                            m.push(0)
                        } else {
                            m.push("fill-opacity:0.65; color:" + p[o].verdictColor)
                        }
                    }
                    m.push(p[o].count);
                    m.push("fill-opacity:0.65; color:" + p[o].verdictColor);
                    s.push(m)
                }
            }
            c.submissionStatisticData = s
        }
        if (u !== null  && u !== "" && u !== undefined) {
            var s = c.submissionStatisticData;
            if (s instanceof Array) {
                var t = s[0].indexOf(u);
                if (t !== -1) {
                    for (var q = s.length - 1; q >= 0; q--) {
                        s[q].splice(t, 2);
                        var r = true;
                        for (var o = 1; o < s[q].length; o += 2) {
                            if (s[q][o] !== 0) {
                                r = false;
                                break
                            }
                        }
                        if (r) {
                            s.splice(q, 1)
                        }
                    }
                }
            }
            c.submissionStatisticData = s
        }
    }
    ;
    c.updateRatingStatisticChart = function(k, q, y) {
        if (k !== null  && k !== "" && k !== undefined && q !== null  && q !== "" && q !== undefined) {
            if (c.ratingStatisticRawData === undefined) {
                c.ratingStatisticRawData = {}
            }
            c.ratingStatisticRawData[q[0].username] = q
        }
        if (y !== null  && y !== "" && y !== undefined) {
            delete c.ratingStatisticRawData[y]
        }
        var v = new google.visualization.DataTable();
        var u = {};
        var r = [];
        var l = [];
        v.addColumn("date", "Contest End Time");
        for (var w in c.ratingStatisticRawData) {
            if (c.ratingStatisticRawData.hasOwnProperty(w)) {
                var p = c.ratingStatisticRawData[w];
                for (var o = 0; o < p.length; o++) {
                    if (o == 0) {
                        v.addColumn("number", p[o].username);
                        v.addColumn({
                            type: "string",
                            role: "tooltip",
                            p: {
                                html: true
                            }
                        });
                        r.push(p[o].username)
                    }
                    if (u[p[o].contestEndTime] === undefined) {
                        u[p[o].contestEndTime] = {};
                        l.push(p[o].contestEndTime)
                    }
                    u[p[o].contestEndTime][p[o].username] = p[o]
                }
            }
        }
        l.sort();
        for (var t = 0; t < l.length; t++) {
            var w = l[t];
            var n = [];
            if (u.hasOwnProperty(w)) {
                var p = u[w];
                n.push(new Date(parseInt(w)));
                for (var o = 0; o < r.length; o++) {
                    var x = r[o];
                    if (u[w][x] !== undefined) {
                        var s = u[w][x];
                        var j = u[w][x].changes;
                        if (j > 0) {
                            j = "+" + j
                        }
                        n.push(s.newRating);
                        var m = "<div style='padding:10px;'><a href='/user/contest/" + s.contestId + "/about' style='color:black; white-space:nowrap; font-weight:bold; text-decoration:none;' target='_blank'>" + s.contestTitle + "<br>" + s.username + ": " + s.newRating + " <span style='color:" + ((j > 0) ? ("green") : ((j < 0) ? ("red") : ("black"))) + "'>(" + j + ")</span></a></div>";
                        n.push(m)
                    } else {
                        n.push(null );
                        n.push(null )
                    }
                }
            }
            v.addRow(n)
        }
        c.ratingStatisticData = v
    }
    ;
    c.refreshSubmissionStatisticChart = function() {
        if (google.visualization !== undefined) {
            if (c.submissionStatisticChart === undefined) {
                if ($("#submissionStatisticChart").length != 0) {
                    c.submissionStatisticChart = new google.visualization.ColumnChart(document.getElementById("submissionStatisticChart"))
                }
            }
            if (c.submissionStatisticData !== undefined && c.submissionStatisticData !== null  && c.submissionStatisticData !== "") {
                c.submissionStatisticChart.draw(google.visualization.arrayToDataTable(c.submissionStatisticData), c.globalChartOptions)
            }
        }
    }
    ;
    c.refreshRatingStatisticChart = function() {
        if (google.visualization !== undefined) {
            if (c.ratingStatisticChart === undefined) {
                if ($("#ratingStatisticChart").length != 0) {
                    c.ratingStatisticChart = new google.visualization.LineChart(document.getElementById("ratingStatisticChart"))
                }
            }
            if (c.ratingStatisticData !== undefined && c.ratingStatisticData !== null  && c.ratingStatisticData !== "") {
                var j = [];
                for (var k = 0; k < c.ratingStatisticData.getNumberOfColumns(); k++) {
                    j.push(d.colorList()[k % d.colorList().length])
                }
                c.ratingStatisticChart.draw(c.ratingStatisticData, {
                    colors: j,
                    tooltip: {
                        isHtml: true
                    },
                    animation: {
                        duration: 1000,
                        easing: "out",
                        startup: true
                    },
                    chartArea: {
                        width: "70%",
                        height: "80%"
                    },
                    pointSize: 5,
                    interpolateNulls: true
                })
            }
        }
    }
    ;
    c.archiveSubmission.nextPage = function() {
        if (c.archiveSubmission.currentPage < c.archiveSubmission.totalPage) {
            c.archiveSubmission.currentPage++;
            c.populateUserArchiveSubmission()
        }
    }
    ;
    c.archiveSubmission.prevPage = function() {
        if (c.archiveSubmission.currentPage > 1) {
            c.archiveSubmission.currentPage--;
            c.populateUserArchiveSubmission()
        }
    }
    ;
    c.populateUserArchiveSubmission = function(i) {
        if (i !== null  && i !== undefined && !isNaN(i)) {
            c.archiveSubmission.currentPage = i
        }
        h.post("/submission/view/user/count/" + c.userData.userId).success(function(j) {
            c.archiveSubmission.count = j;
            c.archiveSubmission.totalPage = Math.ceil(j / c.archiveSubmission.submissionPerPage);
            c.archiveSubmission.pages = d.getPageArr(c.archiveSubmission.currentPage, c.archiveSubmission.totalPage)
        }).error(function(j) {
            console.log("error: " + j)
        });
        if (c.archiveSubmission.currentPage === undefined) {
            c.archiveSubmission.currentPage = 1
        }
        h.post("/submission/view/user/" + c.archiveSubmission.currentPage + "/" + c.userData.userId).success(function(j) {
            c.archiveSubmission.data = j;
            if (c.archiveSubmission.data !== undefined && c.archiveSubmission.data !== null  && c.archiveSubmission.data !== "") {
                c.archiveSubmission.data.forEach(function(k) {
                    if (c.userDataShared !== undefined && k.userId === c.userDataShared.userId) {
                        k.link = "/submission/view/" + k.submissionId;
                        k.backgroundColor = "#FFE3B3"
                    }
                    k.verdictColor = d.getVerdictColor(k.verdict);
                    k.verdictDescription = d.getVerdictDescription(k.verdict);
                })
            }
        }).error(function(j) {
            console.log("error : " + j)
        })
    }
    ;
    c.editProfile = function() {
        c.isWorking = true;
        c.profileSettings.msg = "Processing...";
        var k = new FormData();
        for (var j in c.profileSettings) {
            if (c.profileSettings[j] !== undefined && c.profileSettings[j] !== null  && c.profileSettings[j] !== "") {
                if (j === "profilePicture") {
                    var i = c.profileSettings[j];
                    if (i.size > 256 * 1024) {
                        c.profileSettings.msg = "Failed: maximum profile picture size is 256kb";
                        c.isWorking = false;
                        return
                    }
                    k.append(j, c.profileSettings[j])
                } else {
                    if (j === "oldPassword") {
                        k.append(j, CryptoJS.SHA3(c.profileSettings[j]))
                    } else {
                        if (j === "newPassword") {
                            k.append(j, CryptoJS.SHA3(c.profileSettings[j]))
                        } else {
                            if (j === "confirmNewPassword") {
                                k.append(j, CryptoJS.SHA3(c.profileSettings[j]))
                            } else {
                                k.append(j, c.profileSettings[j])
                            }
                        }
                    }
                }
            }
        }
        k.append("userId", c.userDataShared.userId);
        $.ajax({
            type: "POST",
            url: "/user/edit/profile",
            data: k,
            contentType: false,
            processData: false,
            cache: false,
            success: function(l) {
                c.$apply(function() {
                    if (l.string !== undefined) {
                        c.profileSettings.msg = l.string
                    } else {
                        c.profileSettings.msg = l
                    }
                    if (c.profileSettings.msg === "Success") {
                        c.profileSettings.msg += ", please refresh the page to see changes"
                    }
                    c.isWorking = false
                })
            },
            error: function(l) {
                c.profileSettings.msg = l;
                c.isWorking = false
            }
        })
    }
    ;
    c.getProfilePicture = function(i) {
        h.get("/user/profile/picture/" + i).success(function(j) {
            console.log(j)
        })
    }
    ;
    c.requestResetPasswordToken = function() {
        c.resetRequestMsg = "Processing...";
        c.isWorking = true;
        if ($("#g-recaptcha-response").val() === "") {
            c.resetRequestMsg = "Please complete the captcha challenge and wait for it to finish processing.";
            c.isWorking = false;
            return
        }
        var i = new FormData();
        i.append("username", c.resetUsername);
        i.append("g_recaptcha_response", $("#g-recaptcha-response").val());
        $.ajax({
            type: "POST",
            url: "/user/reset/password/req",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(j) {
                c.$apply(function() {
                    c.resetRequestMsg = j;
                    if (j === "Success") {
                        c.resetTokenSent = true
                    }
                    c.isWorking = false;
                    grecaptcha.reset()
                })
            },
            error: function(j) {
                console.log("error : " + j);
                c.resetRequestMsg = "Error";
                c.isWorking = false;
                grecaptcha.reset()
            }
        })
    }
    ;
    c.tryResetPassword = function() {
        c.msg = "Processing...";
        c.isWorking = true;
        if (c.resetNewPassword !== c.resetConfirmNewPassword) {
            return
        }
        var i = new FormData();
        i.append("username", c.resetUsername);
        i.append("token", c.resetToken);
        i.append("newPassword", String(CryptoJS.SHA3(c.resetNewPassword)));
        $.ajax({
            type: "POST",
            url: "/user/reset/password/try",
            data: i,
            contentType: false,
            processData: false,
            cache: false,
            success: function(j) {
                c.$apply(function() {
                    c.msg = j;
                    c.isWorking = false
                })
            },
            error: function(j) {
                console.log("error : " + j);
                c.msg = "Error";
                c.isWorking = false
            }
        })
    }
    ;
    c.checkLogin = function() {
        h.post("/user/checkLoginSession").success(function(i) {
            if (i) {
                c.userData = i;
                f.setData(c.userData);
                c.getUserNotification();
                if (g.path().indexOf("/user/login") !== -1) {
                    g.path("/")
                }
            }
        }).error(function(i) {
            console.log("Error : " + i)
        })
    }
    ;
    c.hasHiddenProblem = function() {
        h.post("/problem/check/hidden").success(function(i) {
            if (c.userDataShared) {
                c.userDataShared.hasPower = c.userDataShared.hasPower || i
            }
        }).error(function(i) {
            console.log("error");
            console.log(i)
        })
    }
    ;
    c.login = function() {
        if (angular.isDefined(c.userData.username) === false || c.userData.username.length === 0 || angular.isDefined(c.userData.password) === false || c.userData.password.length === 0) {
            c.msg = "All fields must be filled"
        } else {
            var j = CryptoJS.SHA3(c.userData.password);
            var i = new FormData();
            i.append("username", c.userData.username);
            i.append("password", String(j));
            c.msg = "Processing request";
            $.ajax({
                type: "POST",
                url: "/user/login",
                data: i,
                contentType: false,
                processData: false,
                cache: false,
                success: function(k) {
                    c.$apply(function() {
                        if (k === true) {
                            c.checkLogin()
                        } else {
                            if (k === false) {
                                c.msg = "Wrong username or password"
                            } else {
                                c.checkLogin()
                            }
                        }
                    })
                },
                error: function(k) {
                    console.log("Error:" + k)
                }
            })
        }
    }
    ;
    c.register = function() {
        if (angular.isDefined(c.userData.username) === false || c.userData.username.length === 0 || angular.isDefined(c.userData.password) === false || c.userData.password.length === 0 || angular.isDefined(c.userData.email) === false || c.userData.email.length === 0) {
            c.msg = "All fields must be filled"
        } else {
            var j = CryptoJS.SHA3(c.userData.password);
            c.msg = "Processing request";
            c.isWorking = true;
            if ($("#g-recaptcha-response").val() === "") {
                c.msg = "Please complete the captcha challenge and wait for it to finish processing.";
                c.isWorking = false;
                return
            }
            var i = new FormData();
            i.append("username", c.userData.username);
            i.append("password", j);
            i.append("email", c.userData.email);
            i.append("name", c.userData.name);
            i.append("g_recaptcha_response", $("#g-recaptcha-response").val());
            $.ajax({
                type: "POST",
                url: "/user/register",
                data: i,
                contentType: false,
                processData: false,
                cache: false,
                success: function(k) {
                    c.$apply(function() {
                        c.msg = k;
                        c.isWorking = false;
                        grecaptcha.reset()
                    })
                },
                error: function(k) {
                    console.log("error : " + k);
                    c.isWorking = false;
                    grecaptcha.reset()
                }
            })
        }
    }
    ;
    c.logout = function() {
        h.post("/user/logout").success(function() {
            f.setData(undefined);
            g.path("/user/login")
        }).error(function(i) {
            console.log("error : " + i)
        })
    }
    ;
    c.sendFeedback = function() {
        c.isWorking = true;
        $.ajax({
            url: "/user/feedback",
            method: "POST",
            data: {
                feedback: c.feedbackMsg
            },
            success: function(i) {
                c.$apply(function() {
                    c.msg = i;
                    c.isWorking = false
                })
            },
            error: function(i) {
                c.$apply(function() {
                    c.isWorking = false;
                    console.log("error: " + i)
                })
            }
        })
    }
    ;
    c.toCamelCase = function(i) {
        return d.toCamelCase(i)
    }
    ;
    c.clearMsgAndToggleFlip = function() {
        c.msg = "";
        if (c.loginView === "login") {
            c.loginView = "register"
        } else {
            c.loginView = "login"
        }
    }
    ;
    c.getUserDataById = function() {
        h.post("/user/view/" + e.username).success(function(i) {
            if (i === null  || i === undefined || i === "") {
                g.path("/")
            }
            c.userData = i;
            c.profileSettings.email = c.userData.email;
            c.profileSettings.name = c.userData.name;
            // c.loadAllCharts();
            c.populateUserArchiveSubmission();
            // c.getBadges();
        }).error(function(i) {
            console.log("error");
            console.log(i)
        })
    }
}
]).controller("UserToolsCtrl", ["$scope", "$http", "Helper", "$sce", function(b, d, c, a) {
    b.isWorking = false;
    b.userData = undefined;
    b.registeredUserData = [];
    b.realRegisteredUserData = [];
    b.registeredUserDataPlainP = {};
    b.roleData = {};
    b.users = [];
    b.roles = [];
    b.rolePowers = {};
    b.powerList = {};
    b.inputtedUsers = [];
    b.msgRegister = "";
    b.msgUpdate = "";
    b.autocomplete = {};
    b.manageCoin = {
        currentPage: 1,
        totalPage: 1,
        valueAddCoin: 0
    };
    b.parseToHTML = function(e) {
        return c.parseToHTML(a, e)
    }
    ;
    $("#usernameManageCoin").keyup(function(e) {
        if (e.keyCode === 13) {
            b.manageCoin.getUserCoin();
            b.manageCoin.getUserCoinTransaction()
        }
    });
    b.manageCoin.generatePageArray = function() {
        b.manageCoin.totalPage = Math.ceil(b.manageCoin.transactionHistoryCount / 10);
        b.manageCoin.pages = c.getPageArr(b.manageCoin.currentPage, b.manageCoin.totalPage)
    }
    ;
    b.manageCoin.getUserCoin = function() {
        d.post("/user/tools/coin", {
            reqUsername: b.manageCoin.currentUsername
        }).success(function(e) {
            b.manageCoin.coin = e;
            b.manageCoin.coinUsername = b.manageCoin.currentUsername
        }).error(function(e) {
            console.log("error: " + e)
        })
    }
    ;
    b.manageCoin.getUserCoinTransaction = function(e) {
        if (!isNaN(e)) {
            b.manageCoin.currentPage = e
        }
        d.post("/user/tools/coin/transaction/count", {
            reqUsername: b.manageCoin.currentUsername
        }).success(function(f) {
            b.manageCoin.transactionHistoryCount = f;
            b.manageCoin.generatePageArray()
        }).error(function(f) {
            console.log("error: " + f)
        });
        d.post("/user/tools/coin/transaction", {
            reqUsername: b.manageCoin.currentUsername,
            pageNumber: b.manageCoin.currentPage
        }).success(function(f) {
            b.manageCoin.transactionHistory = f
        }).error(function(f) {
            console.log("error: " + f)
        })
    }
    ;
    b.manageCoin.prevPage = function() {
        if (b.manageCoin.currentPage <= 1) {
            return
        }
        b.manageCoin.currentPage--;
        b.manageCoin.getUserCoinTransaction()
    }
    ;
    b.manageCoin.nextPage = function() {
        if (b.manageCoin.currentPage >= b.manageCoin.totalPage) {
            return
        }
        b.manageCoin.currentPage++;
        b.manageCoin.getUserCoinTransaction()
    }
    ;
    b.manageCoin.addUserCoin = function() {
        if (isNaN(b.manageCoin.valueAddCoin)) {
            b.manageCoin.msg = "Invalid coin value";
            return
        }
        if (b.manageCoin.currentUsername === undefined) {
            b.manageCoin.msg = "Username is undefined";
            return
        }
        b.manageCoin.isWorking = true;
        if (confirm("Are you sure you want to add " + b.manageCoin.valueAddCoin + " coins for user [" + b.manageCoin.currentUsername + "]? This action can't be undone")) {
            var e = new FormData();
            e.append("usernameToBeIssued", b.manageCoin.currentUsername);
            e.append("amountIssued", b.manageCoin.valueAddCoin);
            e.append("description", b.manageCoin.valueDescription);
            $.ajax({
                type: "POST",
                url: "/user/tools/coin/add",
                data: e,
                contentType: false,
                processData: false,
                cache: false,
                success: function(f) {
                    b.$apply(function() {
                        b.manageCoin.isWorking = false;
                        b.manageCoin.msg = f;
                        if (f === "Success") {
                            b.manageCoin.getUserCoin();
                            b.manageCoin.getUserCoinTransaction()
                        }
                    })
                },
                error: function(f) {
                    b.manageCoin.isWorking = false;
                    b.manageCoin.msg = f
                }
            })
        } else {
            b.manageCoin.isWorking = false
        }
    }
    ;
    b.loadAuthorizedContests = function() {
        d.post("/announcement/tools/contest/user/special_privilege").success(function(f) {
            f.sort(function e(h, g) {
                if (h.contestId < g.contestId) {
                    return 1
                }
                if (h.contestId > g.contestId) {
                    return -1
                }
                return 0
            });
            b.contests = f
        }).error(function(e) {
            console.log("error");
            console.log(e)
        })
    }
    ;
    b.viewRegisteredUser = function() {
        if (b.userData.contestId !== null  && b.userData.contestId !== undefined && b.userData.contestId !== "") {
            d.post("/user/tools/contest/view/batch", {
                contestId: b.userData.contestId
            }).success(function(f) {
                if (f == null ) {
                    f = []
                }
                for (var e = 0; e < f.length; e++) {
                    f[e].username = f[e].username.substring(f[e].username.indexOf("]") + 1)
                }
                b.realRegisteredUserData = $.extend(true, [], f);
                b.registeredUserData = $.extend(true, [], f)
            }).error(function(e) {
                console.log("Error: " + e)
            })
        }
    }
    ;
    b.deleteBatchCreatedUser = function() {
        if (confirm("Are you sure you want to delete user '" + b.userData.username + "'?")) {
            b.isWorking = true;
            b.msgUpdate = "Processing...";
            var e = new FormData();
            angular.forEach(b.userData, function(g, f) {
                this.append(f, g)
            }, e);
            $.ajax({
                type: "POST",
                url: "/user/tools/contest/delete/batch",
                data: e,
                contentType: false,
                processData: false,
                cache: false,
                success: function(f) {
                    b.$apply(function() {
                        b.msgUpdate = f;
                        if (f === "Success") {
                            for (var g = 0; g < b.registeredUserData.length; g++) {
                                if (b.userData.userId === b.registeredUserData[g].userId) {
                                    b.registeredUserData.splice(g, 1);
                                    b.realRegisteredUserData.splice(g, 1);
                                    break
                                }
                            }
                        }
                        b.isWorking = false
                    })
                },
                error: function(f) {
                    console.log("Error: " + f);
                    b.isWorking = false
                }
            })
        }
    }
    ;
    b.registerBatchUser = function() {
        b.isWorking = true;
        b.msgRegister = "Processing...";
        b.userData.username = [];
        b.userData.name = [];
        b.userData.description = [];
        b.userData.password = [];
        b.userData.plainPassword = [];
        var e = b.userData.registerText.split("\n");
        if (e === null  || e === undefined || e.length === 0) {
            return
        }
        for (var g = 0; g < e.length; g++) {
            if (e[g].length === 0) {
                continue
            }
            var h = e[g].split(",");
            if (h.length === 1) {
                b.userData.username.push(h[0].replace(/\s/g, ""));
                b.userData.name.push(" ");
                b.userData.description.push(" ");
                b.userData.plainPassword.push(c.generateRandomString("abcdefghijklmnopqrstuvwxyz", 7))
            } else {
                if (h.length === 2) {
                    b.userData.username.push(h[0].replace(/\s/g, ""));
                    b.userData.name.push(h[1]);
                    b.userData.description.push(" ");
                    b.userData.plainPassword.push(c.generateRandomString("abcdefghijklmnopqrstuvwxyz", 7))
                } else {
                    if (h.length === 3) {
                        b.userData.username.push(h[0].replace(/\s/g, ""));
                        b.userData.name.push(h[1]);
                        b.userData.description.push(h[2]);
                        b.userData.plainPassword.push(c.generateRandomString("abcdefghijklmnopqrstuvwxyz", 7))
                    } else {
                        if (h.length === 4) {
                            b.userData.username.push(h[0].replace(/\s/g, ""));
                            b.userData.name.push(h[1]);
                            b.userData.description.push(h[2]);
                            b.userData.plainPassword.push(h[3].replace(/\s/g, ""))
                        } else {
                            b.msgRegister = "Too many data on line : " + (g + 1);
                            b.isWorking = false;
                            return
                        }
                    }
                }
            }
        }
        for (var g = 0; g < b.userData.plainPassword.length; g++) {
            if (b.userData.plainPassword[g] === "") {
                b.userData.plainPassword[g] = c.generateRandomString("abcdefghijklmnopqrstuvwxyz", 7)
            }
            var j = CryptoJS.SHA3(b.userData.plainPassword[g]);
            b.userData.password.push(String(j));
            b.registeredUserDataPlainP[b.userData.username[g]] = b.userData.plainPassword[g]
        }
        if (b.userData.contestId === null  || b.userData.contestId === undefined || b.userData.contestId === "") {
            b.msgRegister = "Failed: No contest chosen";
            b.isWorking = false;
            return
        }
        var f = new FormData();
        angular.forEach(b.userData, function(k, i) {
            this.append(i, k)
        }, f);
        $.ajax({
            type: "POST",
            url: "/user/tools/contest/register/batch",
            data: f,
            contentType: false,
            processData: false,
            cache: false,
            success: function(i) {
                b.$apply(function() {
                    b.msgRegister = i;
                    b.isWorking = false;
                    if (i === "Success") {
                        b.viewRegisteredUser()
                    }
                })
            },
            error: function(i) {
                b.isWorking = false;
                b.msgRegister = "Error: " + i + ". Please refresh and redo the registration."
            }
        })
    }
    ;
    b.updateBatchUser = function() {
        b.isWorking = true;
        b.msgUpdate = "Processing...";
        b.userData.userId = [];
        b.userData.username = [];
        b.userData.name = [];
        b.userData.description = [];
        b.userData.plainPassword = [];
        b.userData.password = [];
        for (var f = 0; f < b.registeredUserData.length; f++) {
            if (b.registeredUserData[f] !== b.realRegisteredUserData[f]) {
                b.userData.userId.push(b.registeredUserData[f].userId);
                b.userData.username.push(b.registeredUserData[f].username.replace(/\s/g, ""));
                if (b.registeredUserData[f].name === "" || b.registeredUserData[f].name === undefined || b.registeredUserData[f].name === null ) {
                    b.userData.name.push(" ")
                } else {
                    b.userData.name.push(b.registeredUserData[f].name)
                }
                if (b.registeredUserData[f].description === "" || b.registeredUserData[f].description === undefined || b.registeredUserData[f].description === null ) {
                    b.userData.description.push(" ")
                } else {
                    b.userData.description.push(b.registeredUserData[f].description)
                }
                if (b.registeredUserData[f].plainPassword === "" || b.registeredUserData[f].plainPassword === null  || b.registeredUserData[f].plainPassword === undefined) {
                    b.userData.plainPassword.push("")
                } else {
                    b.userData.plainPassword.push(b.registeredUserData[f].plainPassword.replace(/\s/g, ""))
                }
            }
        }
        for (var f = 0; f < b.userData.plainPassword.length; f++) {
            if (b.userData.plainPassword[f] === "" || b.userData.plainPassword[f] === undefined || b.userData.plainPassword[f] === null ) {
                b.userData.password.push("")
            } else {
                var g = CryptoJS.SHA3(b.userData.plainPassword[f]);
                b.userData.password.push(String(g));
                b.registeredUserDataPlainP[b.userData.username[f]] = b.userData.plainPassword[f]
            }
        }
        if (b.userData.contestId === null  || b.userData.contestId === undefined || b.userData.contestId === "") {
            b.msgUpdate = "Failed: No contest chosen";
            b.isWorking = false;
            return
        }
        var e = new FormData();
        angular.forEach(b.userData, function(i, h) {
            this.append(h, i)
        }, e);
        $.ajax({
            type: "POST",
            url: "/user/tools/contest/update/batch",
            data: e,
            contentType: false,
            processData: false,
            cache: false,
            success: function(h) {
                b.$apply(function() {
                    b.msgUpdate = h;
                    if (h === "Success") {
                        b.realRegisteredUserData = $.extend(true, [], b.registeredUserData)
                    }
                    b.isWorking = false
                })
            },
            error: function(h) {
                b.isWorking = false;
                b.msgUpdate = "Error: " + h + ". The changes might not be saved, to make sure the database has been updated with the last user data, please refresh and redo your last update."
            }
        })
    }
    ;
    b.getAutocompleteUsername = function(e) {
        return d.post("/user/autocomplete", {
            pattern: e
        }).then(function(f) {
            return f.data
        })
    }
    ;
    b.loadUserWithSpecificRole = function(e) {
        if (e == 1) {
            b.users[e] = [];
            return
        }
        d.post("/user/tools/data/role/username", {
            roleId: e
        }).success(function(f) {
            b.users[e] = f
        }).error(function(f) {
            console.log("error: " + f)
        })
    }
    ;
    b.deleteUserFromRoleList = function(f, e) {
        b.users[f].splice(e, 1)
    }
    ;
    b.addUserToRoleList = function(e, f) {
        if (b.autocomplete[e] === "" || f.keyCode !== 13) {
            return
        }
        if ($.inArray(b.autocomplete[e], b.users[e]) === -1) {
            b.users[e].push(b.autocomplete[e])
        }
        b.autocomplete[e] = ""
    }
    ;
    b.changeUserRole = function() {
        var k = new FormData();
        var l = [];
        var f = [];
        for (var h = 0; h < b.roles.length; h++) {
            var e = b.roles[h].roleId;
            for (var g = 0; g < b.users[e].length; g++) {
                f.push(e);
                l.push(b.users[e][g])
            }
        }
        k.append("username", l);
        k.append("roleId", f);
        b.isWorking = true;
        $.ajax({
            type: "POST",
            url: "/user/tools/change_role",
            data: k,
            contentType: false,
            processData: false,
            cache: false,
            success: function(i) {
                b.$apply(function() {
                    b.msg = i;
                    b.isWorking = false
                })
            },
            error: function(i) {
                b.isWorking = false;
                console.log("error : " + i)
            }
        })
    }
    ;
    b.loadRoles = function() {
        d.post("/user/tools/data/role").success(function(e) {
            b.roles = e
        }).error(function(e) {
            console.log("error");
            console.log(e)
        })
    }
    ;
    b.loadRolePowerByRoleId = function(e) {
        d.post("/user/tools/data/power_role", {
            roleId: e
        }).success(function(f) {
            b.powerList = f
        }).error(function(f) {
            console.log("error");
            console.log(f)
        })
    }
    ;
    b.loadAvailableRolePower = function() {
        d.post("/user/tools/data/power").success(function(e) {
            b.rolePowers = e
        }).error(function(e) {
            console.log("error");
            console.log(e)
        })
    }
    ;
    b.isEmptyObject = function(e) {
        return c.isEmptyObject(e)
    }
    ;
    b.moveRolePowerToList = function(g, f, e) {
        if (!b.powerList.hasOwnProperty(g)) {
            b.powerList[g] = {}
        }
        b.powerList[g][f] = e
    }
    ;
    b.deleteRolePowerFromList = function(g, f, e) {
        delete b.powerList[g][f];
        if (b.isEmptyObject(b.powerList[g])) {
            delete b.powerList[g]
        }
    }
    ;
    b.createNewRole = function() {
        b.isWorking = true;
        b.roleData.powerIdList = [];
        angular.forEach(b.powerList, function(g, f) {
            angular.forEach(g, function(i, h) {
                this.push(h)
            }, b.roleData.powerIdList)
        });
        var e = new FormData();
        angular.forEach(b.roleData, function(g, f) {
            this.append(f, g)
        }, e);
        $.ajax({
            type: "POST",
            url: "/user/tools/create_role",
            data: e,
            contentType: false,
            processData: false,
            cache: false,
            success: function(f) {
                b.$apply(function() {
                    b.msg = f;
                    b.isWorking = false
                })
            },
            error: function(f) {
                b.isWorking = false;
                console.log("error : " + f)
            }
        })
    }
    ;
    b.changeRolePower = function() {
        b.roleData.powerIdList = [];
        b.isWorking = true;
        angular.forEach(b.powerList, function(g, f) {
            angular.forEach(g, function(i, h) {
                this.push(h)
            }, b.roleData.powerIdList)
        });
        var e = new FormData();
        angular.forEach(b.roleData, function(g, f) {
            this.append(f, g)
        }, e);
        $.ajax({
            type: "POST",
            url: "/user/tools/edit_role",
            data: e,
            contentType: false,
            processData: false,
            cache: false,
            success: function(f) {
                b.$apply(function() {
                    b.msg = f;
                    b.isWorking = false
                })
            },
            error: function(f) {
                b.isWorking = false;
                console.log("error : " + f)
            }
        })
    }
}
]);
