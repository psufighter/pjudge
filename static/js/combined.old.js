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
    };
    b.nextPage = function() {
        if (b.currPageNum < b.totalPage) {
            b.currPageNum++;
            b.populateAnnouncements()
        }
    };
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
    };
    b.parseToHTML = function(e) {
        return c.parseToHTML(a, e)
    };
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
    };
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
    };
    b.populateAnnouncementsForTools = function() {
        d.post("/announcement/tools/data/announcement").success(function(e) {
            b.announcements = e
        }).error(function(e) {
            console.log("error");
            console.log(e)
        })
    }
}]);
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
}]).controller("ClarificationCtrl", ["$scope", "$routeParams", "$http", "Helper", "UserDataSvc", "UnreadSvc", function(b, d, f, c, e, a) {
    b.unreads = [];
    b.clarifications = [];
    b.clarificationData = {};
    b.allowedToAnswer = null;
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
        if (b.isCollapsed[g] === undefined || b.isCollapsed[g] === null) {
            b.isCollapsed[g] = false
        }
        b.isCollapsed[g] = !b.isCollapsed[g]
    };
    b.loadContestData = function() {
        f.post("/announcement/contest/view/" + d.contestId).success(function(g) {
            b.contestData = g
        }).error(function(g) {
            console.log("error");
            console.log(g)
        })
    };
    b.loadContestProblem = function() {
        f.post("/problem/contest/" + d.contestId).success(function(h) {
            b.problems = h;
            if (b.problems !== undefined && b.problems !== null && b.problems !== "") {
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
    };
    b.sendClarification = function() {
        if (b.clarificationData.problemId === undefined || b.clarificationData.problemId === null || b.clarificationData.problemId === "" || b.clarificationData.subject === null || b.clarificationData.subject === undefined || b.clarificationData.subject === "" || b.clarificationData.question === undefined || b.clarificationData.question === "" || b.clarificationData.question === null) {
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
                if (h !== null && h !== "" && h !== undefined && h !== NaN) {
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
    };
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
                if (h !== null) {
                    b.loadClarificationById(h, true)
                }
                b.isWorking = false
            }).error(function(h) {
                console.log("error");
                console.log(h);
                b.isWorking = false
            })
        }
    };
    b.loadAllClarification = function() {
        var g = {
            contestId: d.contestId
        };
        f.post("/announcement/contest/clarification/list", g).success(function(k) {
            b.unreads = [];
            b.clarifications = k;
            if (k !== null && k !== "" && k !== undefined) {
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
    };
    b.loadAllClarificationSpecial = function() {
        var g = {
            contestId: d.contestId
        };
        f.post("/announcement/contest/clarification/list/all", g).success(function(k) {
            b.unreads = [];
            b.clarifications = k;
            if (k !== null && k !== undefined && k !== "") {
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
    };
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
    };
    b.loadClarificationById = function(i, h) {
        var g = {
            contestId: d.contestId,
            clarificationId: i
        };
        if (g.clarificationId !== null && g.clarificationId !== undefined && g.clarificationId !== "") {
            f.post("/announcement/contest/clarification", g).success(function(k) {
                if (k !== null) {
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
    };
    b.parseDateReadable = function(g) {
        var h = new Date(g);
        return ("0" + h.getDate()).slice(-2) + "-" + b.monthNames[h.getMonth()] + "-" + h.getFullYear() + " " + ("0" + h.getHours()).slice(-2) + ":" + ("0" + h.getMinutes()).slice(-2) + ":" + ("0" + h.getSeconds()).slice(-2)
    };
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
    };
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
    };
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
    };
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
}]).controller("ClarificationSocketCtrl", ["$scope", "$location", "$routeParams", "$http", "UserDataSvc", "UnreadSvc", "Helper", function(b, g, d, f, e, a, c) {
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
    };
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
    };
    b.loadAllClarification = function() {
        f.post("/announcement/contest/clarification/list", {
            contestId: d.contestId
        }).success(function(k) {
            b.unreads = [];
            if (k !== null && k !== "" && k !== undefined) {
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
    };
    b.loadAllClarificationSpecial = function() {
        f.post("/announcement/contest/clarification/list/all", {
            contestId: d.contestId
        }).success(function(k) {
            b.unreads = [];
            if (k !== null && k !== undefined && k !== "") {
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
    };
    b.$on("$routeChangeStart", function(h, i) {
        if (b.stompClient !== undefined) {
            b.stompClient.disconnect()
        }
        clearTimeout(b.reconnectClarificationSocketTimeout)
    });
    b.connect = function() {
        b.socket = new SockJS((g.host() === "localhost") ? "https://localhost:8443/websocket/general/endpoint" : "https://jollybeeoj.com/websocket/general/endpoint");
        b.stompClient = Stomp.over(b.socket);
        b.stompClient.debug = null;
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
}]);
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
}).controller("contestCtrl", ["$scope", "$http", "$location", "$interval", "Helper", function(a, e, d, c, b) {
    a.isWorking = false;
    a.contests = {};
    a.pages = [];
    a.registerMsg = [];
    a.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    a.countDownPromise = undefined;
    a.currTimeSynchronizePromise = undefined;
    a.currTime;
    a.$on("$routeChangeStart", function(g, h) {
        var f = d.path();
        if (f !== "/") {
            a.stopCountDown()
        }
    });
    a.isEmptyObject = function(f) {
        return b.isEmptyObject(f)
    };
    a.parseDateReadable = function(f) {
        var g = new Date(f);
        return ("0" + g.getDate()).slice(-2) + "-" + a.monthNames[g.getMonth()] + "-" + g.getFullYear() + " " + ("0" + g.getHours()).slice(-2) + ":" + ("0" + g.getMinutes()).slice(-2) + ":" + ("0" + g.getSeconds()).slice(-2)
    };
    a.loadUpcomingContest = function() {
        e.post("/announcement/contest/view/current").success(function(f) {
            a.contests = f
        }).error(function(f) {
            console.log("error");
            console.log(f)
        })
    };
    a.loadAllContests = function() {
        e.post("/announcement/tools/data/contest").success(function(g) {
            a.contests = g;
            for (var f = 0; f < a.contests.length; f++) {
                a.contests[f].hasFinished = a.currTime > a.contests[f].endTime
            }
        }).error(function(f) {
            console.log("errror");
            console.log(f)
        })
    };
    a.getDuration = function(g, f) {
        var i = Math.abs(f - g);
        var h = new Date(i);
        h = new Date(h.getTime() + h.getTimezoneOffset() * 60000);
        return (Math.floor(i / 3600000)) + " h(s) " + ("0" + h.getMinutes()).slice(-2) + " min(s)"
    };
    a.contestAboutPath = function(f) {
        return "/user/contest/" + f + "/about"
    };
    a.registerContest = function(g) {
        var f = new FormData();
        f.append("contestId", g);
        $.ajax({
            type: "POST",
            url: "/user/contest/register",
            data: f,
            contentType: false,
            processData: false,
            cache: false,
            success: function(h) {
                a.$apply(function() {
                    alert(h);
                    a.isWorking = false;
                    a.loadAllContests()
                })
            },
            error: function(h) {
                a.isWorking = false;
                console.log("error");
                console.log(h)
            }
        })
    };
    a.getCurrentGlobalTimestamp = function(f) {
        $.ajax({
            type: "GET",
            url: "/announcement/get_server_time",
            success: function(g) {
                a.currTime = g;
                if (a.currTime === undefined || a.currTime === NaN) {
                    setTimeout(function() {
                        a.getCurrentGlobalTimestamp(f)
                    }, 10000)
                } else {
                    if (f) {
                        f()
                    }
                }
            },
            error: function(g) {
                setTimeout(function() {
                    a.getCurrentGlobalTimestamp(f)
                }, 10000)
            }
        })
    };
    a.updateCountDown = function() {
        if (!a.isEmptyObject(a.contests)) {
            a.currTime += 1000;
            if (a.contests[0].startTime > a.currTime) {
                a.cdMsg = "before " + a.contests[0].title;
                a.targetTime = a.contests[0].startTime
            } else {
                if (a.contests[0].endTime >= a.currTime) {
                    a.cdMsg = "time remaining on " + a.contests[0].title;
                    a.targetTime = a.contests[0].endTime
                } else {
                    if (a.contests[0].endTime < a.currTime) {
                        a.cdMsg = a.contests[0].title + " has finished";
                        a.targetTime = undefined;
                        a.contests.shift()
                    }
                }
            }
            if (a.targetTime !== undefined) {
                var f = Math.abs(a.currTime - a.targetTime);
                var g = new Date(f);
                g = new Date(g.getTime() + g.getTimezoneOffset() * 60000);
                a.countDownTime = (Math.floor(f / 3600000)) + " : " + ("0" + g.getMinutes()).slice(-2) + " : " + ("0" + g.getSeconds()).slice(-2)
            }
        } else {
            a.cdMsg = "No upcoming contests"
        }
    };
    a.synchronizeCurrentTime = function() {
        a.getCurrentGlobalTimestamp();
        a.currTimeSynchronizePromise = c(a.getCurrentGlobalTimestamp, 600000)
    };
    a.startCountDown = function(f) {
        a.countDownPromise = c(a.updateCountDown, 1000)
    };
    a.stopCountDown = function() {
        c.cancel(a.countDownPromise);
        c.cancel(a.currTimeSynchronizePromise)
    }
}]).controller("contestToolsCtrl", ["$scope", "$http", "Helper", function(a, c, b) {
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
    };
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
    };
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
    };
    a.loadHiddenProblems = function() {
        c.post("problem/view/hidden").success(function(d) {
            a.problemList = d
        }).error(function(d) {
            console.log("error");
            console.log(d)
        })
    };
    a.loadAllContests = function() {
        c.post("/announcement/tools/data/contest").success(function(d) {
            a.contests = d
        }).error(function(d) {
            console.log("errror");
            console.log(d)
        })
    };
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
    };
    a.moveProblemToAddedList = function(e, d) {
        a.addedProblemList[e] = d
    };
    a.deleteProblemFromAddedList = function(d) {
        delete a.addedProblemList[d]
    };
    a.getLanguages = function() {
        c.post("/submission/view/language").success(function(d) {
            a.allLanguages = d
        }).error(function(d) {
            console.log("error:" + d)
        })
    };
    a.loadContestLanguage = function() {
        c.post("/submission/view/language/" + a.contestData.contestId).success(function(d) {
            a.contestData.languages = d
        }).error(function(d) {
            console.log("error");
            console.log(d)
        })
    };
    a.loadAuthorizedContests = function() {
        c.post("/announcement/tools/contest/user/special_privilege").success(function(d) {
            a.contests = d
        }).error(function(d) {
            console.log("error");
            console.log(d)
        })
    };
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
    };
    a.parseDateTo = function(e, f) {
        var g = new Date(e);
        f.day = g.getDate();
        f.month = g.getMonth() + 1;
        f.year = g.getFullYear();
        f.hour = g.getHours();
        f.minute = g.getMinutes();
        f.second = g.getSeconds()
    };
    a.addContest = function() {
        a.isWorking = true;
        a.contestData.startTimeLong = (new Date(a.startDateData.year, a.startDateData.month - 1, a.startDateData.day, a.startDateData.hour, a.startDateData.minute, a.startDateData.second)).getTime();
        a.contestData.endTimeLong = (new Date(a.endDateData.year, a.endDateData.month - 1, a.endDateData.day, a.endDateData.hour, a.endDateData.minute, a.endDateData.second)).getTime();
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
    };
    a.updateContest = function() {
        a.isWorking = true;
        a.contestData.startTimeLong = (new Date(a.startDateData.year, a.startDateData.month - 1, a.startDateData.day, a.startDateData.hour, a.startDateData.minute, a.startDateData.second)).getTime();
        a.contestData.endTimeLong = (new Date(a.endDateData.year, a.endDateData.month - 1, a.endDateData.day, a.endDateData.hour, a.endDateData.minute, a.endDateData.second)).getTime();
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
    };
    a.deleteLanguage = function(d) {
        a.contestData.languages.splice(d, 1)
    };
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
    };
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
    };
    a.deleteGrantedUser = function(d) {
        a.grantedUsers.splice(d, 1)
    };
    a.deleteDummyUser = function(d) {
        a.dummyUsers.splice(d, 1)
    };
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
}]).controller("contestDetailCtrl", ["$scope", "$http", "$routeParams", "$sce", "$location", "$interval", "Helper", "$anchorScroll", "UserDataSvc", function(i, f, h, g, b, e, c, d, a) {
    i.addHoverCard_username = addHoverCard_username;
    i.removeHoverCard = removeHoverCard;
    i.sterilizeUsername = c.sterilizeUsername;
    i.isWorking = false;
    i.targetTime = undefined;
    i.countDownTime = "--:--:--";
    i.cdMsg = "-";
    i.countDownPromise = undefined;
    i.currTimeSynchronizePromise = undefined;
    i.contestData = {};
    i.contestProblems = {};
    i.contestProblemPath = {};
    i.contestRating = {};
    i.contestRatingHighlightUser = {};
    i.rating = {};
    i.editorial = {};
    i.scoreboardData = {};
    i.scoreboardZeroPointRank = 0;
    i.scoreboardLastUpdateTime = -1;
    i.currentPage = "";
    i.languages = [];
    i.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    i.currTime = undefined;
    i.scoreboardShowDummy = false;
    i.scoreboardShowFull = false;
    i.userStatusInContest = "";
    i.allowRevealFullScoreboard = false;
    i.allowRevealEditorial = false;
    i.flag_runner_tool = false;
    i.flaggedCell = {};
    i.updateContestScoreboardTimeout = null;
    i.$on("$routeChangeStart", function(k, l) {
        var j = b.path();
        if (j !== "/user/contest/" + h.contestId) {
            i.stopCountDown()
        }
        clearTimeout(i.updateContestScoreboardTimeout)
    });
    i.parseToHTML = function(j) {
        return c.parseToHTML(g, j)
    };
    i.$watch(function() {
        return a.getData()
    }, function() {
        i.userDataShared = a.getData()
    });
    i.loadRatingData = function() {
        f.post("/announcement/contest/rating", {
            contestId: h.contestId
        }).success(function(j) {
            i.contestRating = j;
            if (h.user !== undefined) {
                i.contestRatingHighlightUser = h.user;
                b.hash("anchor" + i.contestRatingHighlightUser);
                d.yOffset = 100;
                setTimeout(function() {
                    d()
                }, 1000)
            }
        }).error(function(j) {
            console.log(j)
        })
    };
    i.rating.shareToFacebook = function(q) {
        var m, l;
        var p;
        var k;
        for (var j = 0; j < i.contestRating.length; j++) {
            if (i.contestRating[j].username === q) {
                var o = i.contestRating[j];
                p = o.changes;
                if (p > 0) {
                    p = "+" + p
                }
                m = o.oldRatingTitle;
                l = o.newRatingTitle;
                k = o.userId;
                break
            }
        }
        var n;
        if (m === l) {
            n = "I just got " + p + " rating from " + i.contestData.title + ". Check it out here!"
        } else {
            n = "I just got promoted from " + m + " to " + l + " from " + i.contestData.title + ". Check it out here!"
        }
        FB.ui({
            method: "feed",
            name: "Jollybee Online Judge - Rating Changes",
            caption: "Changes in " + q + "'s rating",
            description: n,
            link: "https://jollybeeoj.com/user/contest/" + i.contestData.contestId + "/rating?user=" + q,
            message: "",
            picture: "jollybeeoj.com/images/logo-med.png"
        }, function(r) {})
    };
    i.loadFlagData = function() {
        var j = c.getCookie("flaggedCell_" + h.contestId);
        if (j === undefined || j === null || j === "") {
            i.flaggedCell = {}
        } else {
            i.flaggedCell = JSON.parse(j)
        }
    };
    i.switchFlagData = function(j, k) {
        if (!i.flaggedCell.hasOwnProperty(j)) {
            i.flaggedCell[j] = false
        }
        i.flaggedCell[j] = !i.flaggedCell[j];
        console.log(i.flaggedCell);
        c.setCookie("flaggedCell_" + h.contestId, JSON.stringify(i.flaggedCell), i.contestData.endTime - (new Date()).getTime() + 3 * 24 * 60 * 60 * 1000, "");
        if (i.flaggedCell[j]) {
            $(k).css("color", "rgba(0,0,0,0.4)")
        } else {
            $(k).css("color", "")
        }
    };
    i.loadContestProblem = function(k, j) {
        f.post("/problem/contest/" + h.contestId).success(function(m) {
            i.contestProblems = m;
            if (i.contestProblems !== "" && i.contestProblems !== null && i.contestProblems !== undefined) {
                i.contestProblems.sort(function l(o, n) {
                    if (o.problemCode < n.problemCode) {
                        return -1
                    }
                    if (o.problemCode > n.problemCode) {
                        return 1
                    }
                    return 0
                })
            }
            if (k) {
                k(j)
            }
        }).error(function(l) {
            console.log("error");
            console.log(l)
        })
    };
    i.editorial.load = function(k) {
        var j = new FormData();
        j.append("contestId", h.contestId);
        j.append("contestProblemId", k);
        $.ajax({
            url: "/announcement/contest/view/editorial",
            method: "POST",
            data: j,
            contentType: false,
            processData: false,
            cache: false,
            success: function(l) {
                i.$apply(function() {
                    if (l === "") {
                        l = "There is no editorial for this problem"
                    }
                    i.editorial.html = l;
                    i.editorial.showingId = k
                })
            },
            error: function(l) {
                console.log("error: " + l)
            }
        })
    };
    i.checkRevealEditorial = function() {
        f.post("/announcement/contest/editorial/public/check/" + h.contestId).success(function(j) {
            i.allowRevealEditorial = j
        }).error(function(j) {
            console.log("error: " + j)
        })
    };
    i.loadContestData = function(j) {
        if (c.isEmptyObject(i.contestData) === false) {
            if (j) {
                j()
            }
            return
        }
        f.post("/announcement/contest/view/" + h.contestId).success(function(l) {
            i.contestData = l;
            $("head > title").remove();
            var k;
            if (b.path().indexOf("/about") !== -1) {
                k = "About"
            } else {
                if (b.path().indexOf("/problem") !== -1) {
                    k = "Problem"
                } else {
                    if (b.path().indexOf("/textsubmission") !== -1) {
                        k = "Submit"
                    } else {
                        if (b.path().indexOf("/judgestatus") !== -1) {
                            k = "Judge Status"
                        } else {
                            if (b.path().indexOf("/clarification") !== -1) {
                                k = "Clarification"
                            } else {
                                if (b.path().indexOf("/scoreboard") !== -1) {
                                    k = "Scoreboard"
                                } else {
                                    if (b.path().indexOf("/rating") !== -1) {
                                        k = "Rating Changes"
                                    } else {
                                        if (b.path().indexOf("/editorial") !== -1) {
                                            k = "Editorial"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            $("head").append("<title>Contest - " + i.contestData.title + ((k !== "" && k !== undefined && k !== null) ? (" - " + k) : ("")) + "</title>");
            i.loadContestLanguage();
            if (j) {
                j()
            }
        }).error(function(k) {
            console.log("error");
            console.log(k)
        })
    };
    i.loadContestLanguage = function() {
        f.post("/submission/view/language/" + h.contestId).success(function(j) {
            i.contestData.languages = j
        }).error(function(j) {
            console.log("error");
            console.log(j)
        })
    };
    i.refreshContestProblemPath = function() {
        for (var j in i.contestProblems) {
            var l = i.contestProblems[j].problemId;
            if (i.allowRevealProblemToPublic === true) {
                i.contestProblemPath[l] = "/user/contest/" + h.contestId + "/problem/" + l;
                continue
            }
            if (i.userStatusInContest !== "Dummy User" && i.userStatusInContest !== "Special Privileged User" && i.userStatusInContest !== "Contestant") {
                break
            }
            i.contestProblemPath[l] = "/user/contest/" + h.contestId + "/problem/" + l
        }
    };
    i.loadScoreboardData = function() {
        i.flag_runner_tool = (h.flag !== undefined);
        if (i.flag_runner_tool) {
            i.loadFlagData()
        }
        f.post("/problem/contest/" + h.contestId).success(function(k) {
            i.contestProblems = k;
            if (i.contestProblems !== null && i.contestProblems !== undefined && i.contestProblems !== "") {
                i.contestProblems.sort(function j(m, l) {
                    if (m.problemCode < l.problemCode) {
                        return -1
                    }
                    if (m.problemCode > l.problemCode) {
                        return 1
                    }
                    return 0
                })
            }
            i.refreshContestProblemPath();
            i.loadScoreboard()
        }).error(function(j) {
            console.log("error");
            console.log(j)
        })
    };
    i.checkUserStatusInContest = function() {
        var j = new FormData();
        j.append("contestId", h.contestId);
        $.ajax({
            type: "POST",
            url: "/announcement/contest/user_status/check",
            data: j,
            contentType: false,
            processData: false,
            cache: false,
            success: function(k) {
                i.$apply(function() {
                    i.userStatusInContest = k;
                    i.refreshContestProblemPath()
                })
            },
            error: function(k) {
                console.log("error : " + k)
            }
        })
    };
    i.checkAllowRevealFullScoreboard = function() {
        f.post("/announcement/contest/scoreboard/full/check/" + h.contestId).success(function(j) {
            if (j === true || j === false) {
                i.allowRevealFullScoreboard = j
            }
            i.refreshContestProblemPath()
        }).error(function(j) {
            console.log("error " + j)
        })
    };
    i.loadScoreboard = function() {
        if (b.url().indexOf("scoreboard") === -1) {
            return
        }
        i.loadContestData(function() {
            f.post("/announcement/contest/view/scoreboard/" + h.contestId, {
                showDummy: i.scoreboardShowDummy,
                showFull: i.scoreboardShowFull,
                time: i.scoreboardLastUpdateTime
            }).success(function(q) {
                if (q === null || q === "null" || q === undefined || q === "undefined" || q === "") {
                    clearTimeout(i.updateContestScoreboardTimeout);
                    i.updateContestScoreboardTimeout = setTimeout(function() {
                        i.loadScoreboard()
                    }, 20000);
                    return
                }
                i.scoreboardData = q.value;
                i.scoreboardLastUpdateTime = q.key;
                var k = false;
                for (var r = 0; r < i.contestProblems.length; r++) {
                    var n = -1;
                    var t = -1;
                    var s = i.contestProblems[r].problemId;
                    if (!k) {
                        i.scoreboardZeroPointRank = 0
                    }
                    for (var o = 0; o < i.scoreboardData.length; o++) {
                        if (i.scoreboardData[o].acceptedTime.hasOwnProperty(s)) {
                            if (i.scoreboardData[o].acceptedTime[s] !== null) {
                                if (i.scoreboardData[o].acceptedTime[s] < n || n === -1) {
                                    n = i.scoreboardData[o].acceptedTime[s];
                                    if (t !== -1) {
                                        i.scoreboardData[t].cell[s].firstAc = false
                                    }
                                    t = o;
                                    i.scoreboardData[o].cell[s].firstAc = true
                                }
                            }
                        }
                        if (!k) {
                            var v = i.scoreboardData[o].username.indexOf("]");
                            if (v !== -1) {
                                i.scoreboardData[o].username = i.scoreboardData[o].username.substr(v + 1)
                            }
                            if (i.scoreboardData[o].score !== 0) {
                                i.scoreboardZeroPointRank = o + 1
                            }
                        }
                    }
                    if (!k) {
                        i.scoreboardZeroPointRank++
                    }
                    k = true
                }
                if (!k) {
                    i.scoreboardZeroPointRank = 0;
                    for (var r = 0; r < i.scoreboardData.length; r++) {
                        var v = i.scoreboardData[r].username.indexOf("]");
                        if (v !== -1) {
                            i.scoreboardData[r].username = i.scoreboardData[r].username.substr(v + 1)
                        }
                        if (i.scoreboardData[r].score !== 0) {
                            i.scoreboardZeroPointRank = r + 1
                        }
                    }
                    i.scoreboardZeroPointRank++
                }
                var m = "";
                m += "<thead><tr class='table table-hover' id='dataTable'>";
                m += "<td class='tableHeader anim:position'>Rank</td>";
                m += "<td class='tableHeader anim:id'>Name</td>";
                m += "<td class='tableHeader'>Solved</td>";
                m += "<td class='tableHeader'>Time Penalty</td>";
                for (var r = 0; r < i.contestProblems.length; r++) {
                    var x = i.contestProblemPath[i.contestProblems[r].problemId];
                    m += "<td class='tableHeader'><a class='problemScoreboardLink' " + ((x === undefined || x === "undefined" || x === null || x === "null" || x === "") ? ("") : (" href='" + x + "' ")) + " data-toggle='tooltip' data-placement='top' data-original-title='" + i.contestProblems[r].title + "'>" + i.contestProblems[r].problemCode + "</a></td>"
                }
                m += "</tr></thead><tbody>";
                for (var r = 0; r < i.scoreboardData.length; r++) {
                    m += "<tr>";
                    var q = i.scoreboardData[r];
                    if (q.score > 0) {
                        m += "<td><center><span class='scoreboardCellWrapper'>" + (r + 1) + "</span></center></td>"
                    } else {
                        m += "<td><center><span class='scoreboardCellWrapper'>" + i.scoreboardZeroPointRank + "</span></center></td>"
                    }
                    m += "<td style='text-align:left'><span class='scoreboardCellWrapper' style='padding-left:8px; padding-right:8px;'><a onmouseover='addHoverCard_username(this, \"" + q.username + "\")' onmouseleave='removeHoverCard()' href='/user/view/" + q.username + "' target='_blank' class='username' style='color:" + q.ratingColor + "'>" + q.username + "</a>" + ((q.description !== "") ? ("<span class='scoreboardUserDescription'><br>" + q.description + "</span>") : ("")) + "</span></td>";
                    m += "<td><center><span class='scoreboardCellWrapper'>" + q.score + "</span></center></td>";
                    m += "<td><center><span class='scoreboardCellWrapper'>" + q.penalty + "</span></center></td>";
                    for (var o = 0; o < i.contestProblems.length; o++) {
                        var l = i.contestProblems[o];
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
                                m += "<small>" + i.getDiffAccTime(q.acceptedTime[l.problemId]) + "</small>"
                            }
                            if (i.flag_runner_tool && u.accepted) {
                                var w = q.username + "-" + l.problemId;
                                m += '<span class="scoreboardFlag" onclick=\'angular.element(this).scope().switchFlagData("' + w + "\", this);'><span id='" + w + "' class='glyphicon glyphicon-flag' style='vertical-align:middle; " + ((i.flaggedCell[w]) ? ("color: rgba(0,0,0,0.4);") : ("")) + "'></span></center>"
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
                clearTimeout(i.updateContestScoreboardTimeout);
                i.updateContestScoreboardTimeout = setTimeout(function() {
                    i.loadScoreboard()
                }, 20000)
            }).error(function(j) {
                console.log("error");
                console.log(j)
            })
        })
    };
    i.toggleScoreboardShowFull = function() {
        i.scoreboardShowFull = !i.scoreboardShowFull;
        i.scoreboardLastUpdateTime = -1;
        i.loadScoreboard()
    };
    i.toggleScoreboardShowDummy = function() {
        i.scoreboardShowDummy = !i.scoreboardShowDummy;
        i.scoreboardLastUpdateTime = -1;
        i.loadScoreboard()
    };
    i.getDiffAccTime = function(k) {
        var l = (k - i.contestData.startTime) / 1000;
        var j = Math.floor(l / 3600);
        var m = Math.floor((l % 3600) / 60);
        if (j < 10) {
            j = "0" + j
        } else {
            j = "" + j
        }
        if (m < 10) {
            m = "0" + m
        } else {
            m = "" + m
        }
        return j + ":" + m
    };
    i.parseDateReadable = function(j) {
        if (j) {
            var k = new Date(j);
            return ("0" + k.getDate()).slice(-2) + "-" + i.monthNames[k.getMonth()] + "-" + k.getFullYear() + " " + ("0" + k.getHours()).slice(-2) + ":" + ("0" + k.getMinutes()).slice(-2) + ":" + ("0" + k.getSeconds()).slice(-2)
        }
    };
    i.getCurrentGlobalTimestamp = function() {
        $.ajax({
            type: "GET",
            url: "/announcement/get_server_time",
            success: function(j) {
                i.currTime = j;
                if (i.currTime === undefined || i.currTime === NaN) {
                    setTimeout(i.getCurrentGlobalTimestamp, 10000)
                }
            },
            error: function(j) {
                setTimeout(function() {
                    i.getCurrentGlobalTimestamp
                }, 10000)
            }
        })
    };
    i.updateCountDown = function() {
        i.currTime += 1000;
        if (i.contestData.startTime > i.currTime) {
            i.cdMsg = "before start";
            i.targetTime = i.contestData.startTime
        } else {
            if (i.contestData.endTime >= i.currTime) {
                i.cdMsg = "time remaining";
                i.targetTime = i.contestData.endTime
            } else {
                if (i.contestData.endTime < i.currTime) {
                    i.countDownTime = "--:--:--";
                    i.cdMsg = "Contest has finished";
                    i.targetTime = undefined;
                    i.stopCountDown()
                }
            }
        }
        if (i.targetTime !== undefined) {
            var j = Math.abs(i.currTime - i.targetTime);
            var k = new Date(j);
            k = new Date(k.getTime() + k.getTimezoneOffset() * 60000);
            i.countDownTime = (Math.floor(j / 3600000)) + " : " + ("0" + k.getMinutes()).slice(-2) + " : " + ("0" + k.getSeconds()).slice(-2)
        }
    };
    i.synchronizeCurrentTime = function() {
        i.getCurrentGlobalTimestamp();
        i.currTimeSynchronizePromise = e(i.getCurrentGlobalTimestamp, 600000)
    };
    i.startCountDown = function(j) {
        i.countDownPromise = e(i.updateCountDown, 1000)
    };
    i.stopCountDown = function() {
        e.cancel(i.countDownPromise);
        e.cancel(i.currTimeSynchronizePromise)
    }
}]);
angular.module("helperModule", []).service("Helper", Helper);

function Helper() {
    this.getVerdictDescription = getVerdictDescription;
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
};
angular.module("mainModule", ["userModule", "announcementModule", "problemModule", "navModule", "submissionModule", "contestModule", "clarificationModule", "ngRoute"]).config(["$locationProvider", "$httpProvider", "$routeProvider", function(a, c, b) {
    configLocation(a);
    configHttp(c);
    configRoute(b)
}]).run(["$rootScope", "$route", "$routeParams", function(a, c, b) {
    a.$on("$routeChangeSuccess", function() {
        if (typeof c.current.title === "function") {
            document.title = c.current.title(b)
        } else {
            document.title = c.current.title
        }
        if (c.current.meta.property !== undefined && c.current.meta.property !== null) {
            for (var d in c.current.meta.property) {
                $('meta[property="' + d + '"]').remove();
                $("head").append('<meta property="' + d + '" content="' + c.current.meta.property[d] + '"/>')
            }
        }
        if (c.current.meta.name !== undefined && c.current.meta.name !== null) {
            for (var d in c.current.meta.name) {
                $('meta[name="' + d + '"]').remove();
                $("head").append('<meta name="' + d + '" content="' + c.current.meta.name[d] + '"/>')
            }
        }
    })
}]);

function configRoute(a) {
    a.when("/", {
        templateUrl: "/static/html/home.html",
        title: "Jollybee Online Judge",
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
        var k = "",
            c, l, g, d, h, j, e;
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
                    if (l !== undefined && l !== null) {
                        k += encodeURIComponent(c) + "=" + encodeURIComponent(l) + "&"
                    }
                }
            }
        }
        return k.length ? k.substr(0, k.length - 1) : k
    };
    a.defaults.transformRequest = [function(c) {
        return angular.isObject(c) && String(c) !== "[object File]" ? b(c) : c
    }]
};
angular.module("navModule", ["helperModule", "userModule"]).controller("NavCtrl", ["$scope", "$http", "$location", function(a, c, b) {
    a.navIndex = -1;
    a.setIndex = function(d) {
        a.navIndex = d
    };
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
    };
    a.$on("$routeChangeSuccess", a.refreshHeaderNav)
}]).controller("ToolsNavCtrl", ["$scope", "$http", "$location", "UserDataSvc", "Helper", function(a, e, d, c, b) {
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
    };
    a.getLastTool = function() {
        if (c.getData() !== undefined && c.getData().hasPower) {
            var f = b.getCookie(a.cookieName);
            if (f !== undefined) {
                a.switchTools(a.toolsName[f])
            } else {
                a.switchTools(a.toolsName[0])
            }
        }
    };
    a.getAuthorizedTools = function() {
        e.post("user/tools").success(function(f) {
            a.authorizedTools = f
        }).error(function(f) {
            console.log("error");
            console.log(f)
        })
    };
    a.getLastTool()
}]).controller("ContestNavCtrl", ["$scope", "$http", "$location", "$routeParams", "UserDataSvc", "Helper", function(a, f, e, c, d, b) {
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
    };
    a.getContestMenu()
}]);
angular.module("problemModule", ["helperModule", "submissionModule", "userModule"]).directive("fileModel", ["$parse", function(a) {
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
}]).directive("fileModelR", ["$parse", function(a) {
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
}]).controller("ProblemCtrl", ["$scope", "$http", "$location", "$routeParams", "$window", "UserDataSvc", "Helper", "$sce", function(b, h, g, d, e, f, c, a) {
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
    };
    b.nextPage = function() {
        if (b.currPageNum < b.totalPage) {
            b.currPageNum++;
            b.populateVisibleProblems()
        }
    };
    b.getAutocompleteUsername = function(i) {
        return h.post("/user/autocomplete", {
            pattern: i
        }).then(function(j) {
            return j.data
        })
    };
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
                if (i[s] === undefined || i[s] === null || i[s] === "") {
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
        };
        k(b.browseProblemByContestStructure, 0, 0);
        b.problemByContestOn[0] = true;
        b.problemByContestTreeAdjList = i;
        b.browseProblemByContestStructure = j
    };
    b.getLatestProblemComment = function() {
        h.post("/problem/comment/latest").success(function(i) {
            b.latestProblemComment = i
        }).error(function(i) {
            console.log("error");
            console.log(i)
        })
    };
    b.clickBrowseProblemByContest = function(i) {
        var j = function(m) {
            if (b.problemByContestOn[m] === false) {
                return
            }
            if (b.problemByContestTreeAdjList[m] === undefined || b.problemByContestTreeAdjList[m] === null || b.problemByContestTreeAdjList[m] === "") {
                return
            }
            b.problemByContestOn[m] = false;
            for (var k = 0; k < b.problemByContestTreeAdjList[m].length; k++) {
                var l = b.problemByContestTreeAdjList[m][k];
                if (b.problemByContestOn[l]) {
                    j(l)
                }
            }
        };
        if (b.problemByContestOn[i]) {
            j(i)
        } else {
            b.problemByContestOn[i] = true
        }
    };
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
    };
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
    };
    b.visibleProblem.changePageType = function(i) {
        b.visibleProblem.pageType = i;
        b.currPageNum = 1;
        b.populateVisibleProblems()
    };
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
    };
    b.checkAllowRevealProblemToPublic = function() {
        h.post("/announcement/contest/problem/public/check/" + d.contestId).success(function(i) {
            if (i === true || i === false) {
                b.allowRevealProblemToPublic = i
            }
            b.refreshContestProblemPath()
        }).error(function(i) {
            console.log("error " + i)
        })
    };
    b.truncateProblemTitle = function(j) {
        for (var k = 0; k < b.problems.length; k++) {
            if (b.problems[k].title.length > j) {
                b.problems[k].title = b.problems[k].title.substr(0, j) + "..."
            }
        }
    };
    b.populateVisibleProblems = function(j, k) {
        if (j !== null && j !== undefined && !isNaN(j)) {
            b.currPageNum = j
        }
        if (k !== undefined && k !== null) {
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
            if (i !== undefined && i !== null && i !== "") {
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
            sort: (b.visibleProblem.sort.order === "desc" ? "-" : "") + b.visibleProblem.sort.column,
            bookmarks: (b.visibleProblem.pageType === "bookmarks")
        }).success(function(l) {
            b.visibleProblem.data = l;
            b.problems = l
        }).error(function(l) {
            console.log("error : " + l)
        })
    };
    b.populateHiddenProblems = function() {
        h.post("problem/view/hidden").success(function(i) {
            b.hiddenProblems = i;
            b.problems = b.hiddenProblems
        }).error(function(i) {
            console.log("error : " + i)
        })
    };
    b.toggleHiddenProblem = function() {
        b.isShowingHidden = !b.isShowingHidden;
        if (b.isShowingHidden) {
            b.populateHiddenProblems()
        } else {
            b.populateVisibleProblems()
        }
    };
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
    };
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
        if (b.problemData.hint === undefined || b.problemData.hint === null) {
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
    };
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
        if (b.problemData.hint === undefined || b.problemData.hint === null) {
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
    };
    b.updateContestProblem = function() {
        b.msg = "Processing...";
        b.isWorking = true;
        if (b.problemData.editorial !== null && b.problemData.editorial !== undefined && b.problemData.editorial !== "") {
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
        i.append("editorial", null);
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
    };
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
    };
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
    };
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
    };
    b.loadContestProblem = function(j, i) {
        b.problems = b.$parent.contestProblems;
        h.post("/problem/contest/" + d.contestId).success(function(l) {
            b.problems = l;
            if (b.problems !== "" && b.problems !== null && b.problems !== undefined) {
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
    };
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
    };
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
    };
    b.loadAllProblemImages = function(i) {
        h.post("/problem/tools/data/image", {
            problemId: i
        }).success(function(j) {
            b.imageIds = j
        }).error(function(j) {
            console.log("error");
            console.log(j)
        })
    };
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
    };
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
    };
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
    };
    b.addProblemImage = function() {
        if (b.contestData.contestId !== undefined && b.contestData.contestId !== null) {
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
    };
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
    };
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
    };
    b.fullImgPath = function(i) {
        return "/problem/image/" + i
    };
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
    };
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
    };
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
    };
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
    };
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
}]).controller("ProblemDetailCtrl", ["$scope", "$http", "$routeParams", "$sce", "$location", "Helper", "UserDataSvc", function(b, g, d, a, f, c, e) {
    b.addHoverCard_username = addHoverCard_username;
    b.removeHoverCard = removeHoverCard;
    b.userDataShared = {};
    b.problemDetails = {};
    b.comments = {
        show: false,
        data: [],
        currentPage: 1,
        totalPage: 1
    };
    b.isWorking = false;
    b.currentPage = "prob_desc";
    b.editor = undefined;
    b.$watch(function() {
        return e.getData()
    }, function() {
        b.userDataShared = e.getData()
    });
    b.changePage = function(h) {
        b.currentPage = h
    };
    b.parseToHTML = function(h) {
        return c.parseToHTML(a, h)
    };
    b.comments.prevPage = function() {
        if (b.comments.currentPage > 1) {
            b.comments.currentPage--
        }
        b.comments.pages = c.getPageArr(b.comments.currentPage, b.comments.totalPage);
        b.comments.get(b.comments.currentPage)
    };
    b.comments.nextPage = function() {
        if (b.comments.currentPage < b.comments.totalPage) {
            b.comments.currentPage++
        }
        b.comments.pages = c.getPageArr(b.comments.currentPage, b.comments.totalPage);
        b.comments.get(b.comments.currentPage)
    };
    b.comments.toggle = function() {
        b.comments.show = !b.comments.show;
        b.comments.get(b.comments.currentPage)
    };
    b.comments.toggleEditing = function(h, i) {
        if (b.comments.data[h].isEditing) {
            if (!i) {
                if (!(/\S/.test(b.comments.data[h].textEdit))) {
                    return
                }
                g.post("/problem/comment/edit", {
                    problemCommentId: b.comments.data[h].problemCommentId,
                    newComment: b.comments.data[h].textEdit
                }).success(function(j) {
                    if (j) {
                        b.comments.data[h].comment = b.comments.data[h].textEdit;
                        b.comments.data[h].isEditing = false;
                        b.comments.data[h].dateEdited = -1
                    }
                }).error(function(j) {
                    console.log("error: " + j)
                })
            } else {
                b.comments.data[h].isEditing = false
            }
        } else {
            b.comments.data[h].isEditing = true;
            b.comments.data[h].textEdit = b.comments.data[h].comment
        }
    };
    b.comments.vote = function(h, i) {
        if (isNaN(h)) {
            return
        }
        if (b.userDataShared === undefined) {
            return
        }
        if (i < -1) {
            i = -1
        }
        if (i > 1) {
            i = 1
        }
        if (i === b.comments.data[h].userVote) {
            i = 0
        }
        g.post("/problem/comment/vote", {
            problemCommentId: b.comments.data[h].problemCommentId,
            vote: i
        }).success(function(j) {
            if (j === true) {
                if (b.comments.data[h].userVote === -1) {
                    b.comments.data[h].hateCount--
                } else {
                    if (b.comments.data[h].userVote === 1) {
                        b.comments.data[h].likeCount--
                    }
                }
                if (i === 1) {
                    b.comments.data[h].likeCount++
                } else {
                    if (i === -1) {
                        b.comments.data[h].hateCount++
                    }
                }
                b.comments.data[h].userVote = i
            }
        }).error(function(j) {
            console.log("error: " + j)
        })
    };
    b.comments.get = function(h) {
        if (isNaN(h)) {
            return
        }
        b.comments.currentPage = h;
        g.post("/problem/comment/count", {
            problemId: d.problemId
        }).success(function(i) {
            b.comments.totalPage = Math.ceil(i / 10);
            b.comments.pages = c.getPageArr(b.comments.currentPage, b.comments.totalPage)
        }).error(function(i) {
            console.log("error: " + i)
        });
        g.post("/problem/comment/get", {
            problemId: d.problemId,
            page: b.comments.currentPage
        }).success(function(i) {
            if (i) {
                b.comments.data = i
            }
        }).error(function(i) {
            console.log("error: " + i)
        })
    };
    b.comments.add = function() {
        if (!(/\S/.test(b.comments.textAdd))) {
            return
        }
        b.isWorking = true;
        g.post("/problem/comment/add", {
            problemId: d.problemId,
            comment: b.comments.textAdd
        }).success(function(h) {
            if (h) {
                b.comments.textAdd = "";
                if (b.comments.currentPage === 1) {
                    b.comments.data.unshift(h);
                    if (b.comments.data.length > 10) {
                        b.comments.data.pop()
                    }
                } else {
                    b.comments.get(1)
                }
            }
            b.isWorking = false
        }).error(function(h) {
            b.isWorking = false;
            console.log("error: " + h)
        })
    };
    b.bookmarkProblem = {
        isBookmarked: false
    };
    b.bookmarkProblem.check = function() {
        g.post("/problem/bookmark/check", {
            problemId: d.problemId
        }).success(function(h) {
            b.bookmarkProblem.isBookmarked = h
        }).error(function(h) {
            console.log("error: " + h)
        })
    };
    b.bookmarkProblem.add = function() {
        g.post("/problem/bookmark/add", {
            problemId: d.problemId
        }).success(function(h) {
            if (h) {
                b.bookmarkProblem.isBookmarked = true
            }
        }).error(function(h) {
            console.log("error: " + h)
        })
    };
    b.bookmarkProblem.remove = function() {
        g.post("/problem/bookmark/remove", {
            problemId: d.problemId
        }).success(function(h) {
            if (h) {
                b.bookmarkProblem.isBookmarked = false
            }
        }).error(function(h) {
            console.log("error: " + h)
        })
    };
    b.hintMouseDown = function() {
        b.problemDetails.showHint = true
    };
    b.hintMouseUp = function() {
        b.problemDetails.showHint = false
    };
    b.populateProblemDetails = function() {
        g.post("problem/view/" + d.problemId).success(function(i) {
            b.problemDetails = i;
            b.problemDetails.showHint = false;
            var h = c.getCookie("problemDetailsLocale");
            if (h === undefined || (h !== "EN" && h !== "VI")) {
                b.problemDetails.locale = "EN"
            } else {
                b.problemDetails.locale = h
            }
            if (b.problemDetails.descriptions.EN === undefined || b.problemDetails.descriptions.EN.problem === null || b.problemDetails.descriptions.EN.problem === "undefined" || b.problemDetails.descriptions.EN.problem === "null" || b.problemDetails.descriptions.EN.problem === "") {
                b.problemDetails.localeAvailableEN = false
            } else {
                b.problemDetails.localeAvailableEN = true
            }
            if (b.problemDetails.descriptions.VI === undefined || b.problemDetails.descriptions.VI.problem === null || b.problemDetails.descriptions.VI.problem === "undefined" || b.problemDetails.descriptions.VI.problem === "null" || b.problemDetails.descriptions.VI.problem === "") {
                b.problemDetails.localeAvailableVI = false
            } else {
                b.problemDetails.localeAvailableVI = true
            }
            if (b.problemDetails["localeAvailable" + b.problemDetails.locale] === false) {
                if (b.problemDetails.locale === "EN") {
                    b.problemDetails.locale = "VI"
                } else {
                    b.problemDetails.locale = "EN"
                }
            }
            $("head > title").remove();
            $("head").append("<title>Problem - " + i.problemId + " - " + i.title + "</title>")
        }).error(function(h) {
            console.log("error : " + h)
        })
    };
    b.problemDetailChangeLocale = function(h) {
        b.problemDetails.locale = h;
        c.setCookie("problemDetailsLocale", h, 12 * 30 * 24 * 60 * 60 * 1000, "")
    };
    b.parseToHTML = function(h) {
        return c.parseToHTML(a, h)
    };
    b.populateContestProblemDetails = function() {
        g.post("problem/view/contest/" + d.problemId, {
            contestId: d.contestId
        }).success(function(i) {
            b.problemDetails = i;
            if (i === null || i === "" || i === undefined) {
                f.path("/user/contest/" + d.contestId + "/problem")
            } else {
                var h = c.getCookie("problemDetailsLocale");
                if (h === undefined || (h !== "EN" && h !== "VI")) {
                    b.problemDetails.locale = "EN"
                } else {
                    b.problemDetails.locale = h
                }
                if (b.problemDetails.descriptions.EN.problem === undefined || b.problemDetails.descriptions.EN.problem === null || b.problemDetails.descriptions.EN.problem === "undefined" || b.problemDetails.descriptions.EN.problem === "null" || b.problemDetails.descriptions.EN.problem === "") {
                    b.problemDetails.localeAvailableEN = false
                } else {
                    b.problemDetails.localeAvailableEN = true
                }
                if (b.problemDetails.descriptions.VI.problem === undefined || b.problemDetails.descriptions.VI.problem === null || b.problemDetails.descriptions.VI.problem === "undefined" || b.problemDetails.descriptions.VI.problem === "null" || b.problemDetails.descriptions.VI.problem === "") {
                    b.problemDetails.localeAvailableVI = false
                } else {
                    b.problemDetails.localeAvailableVI = true
                }
                if (b.problemDetails["localeAvailable" + b.problemDetails.locale] === false) {
                    if (b.problemDetails.locale === "EN") {
                        b.problemDetails.locale = "VI"
                    } else {
                        b.problemDetails.locale = "EN"
                    }
                }
            }
        }).error(function(h) {
            console.log("error : " + h)
        })
    }
}]);
$(document).ready(function() {
    $("body").tooltip({
        selector: "[data-toggle=tooltip]"
    });
    if (false) setInterval(function() {
        $.ajax({
            url: "/user/heartbeat",
            method: "POST",
            error: function(c) {
                var b = this;
                setTimeout(function() {
                    $.ajax(b)
                }, 10000)
            }
        })
    }, 600000)
});
var hoverCardPromise = null;
var hoverCard_username = null;

function addHoverCard(b, a) {
    $("#hoverCard").remove();
    $(b).append("<div onmouseenter='clearTimeout(hoverCardPromise)' onmouseleave='removeHoverCard()' id='hoverCard'>" + a + "</div>")
}

function removeHoverCard() {
    clearTimeout(hoverCardPromise);
    hoverCardPromise = setTimeout(function() {
        $("#hoverCard").remove();
        hoverCard_username = null
    }, 500)
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
                if (c !== null && c !== "") {
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
};
angular.module("submissionModule", ["helperModule", "ngAnimate", "userModule"]).value("ownSubmitBg", "#FFE3B3").directive("fileModel", ["$parse", function(a) {
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
}]).controller("SubmissionCtrl", ["$scope", "$location", "$http", "$routeParams", "Helper", function(a, e, d, c, b) {
    a.addHoverCard_username = addHoverCard_username;
    a.removeHoverCard = removeHoverCard;
    a.msg = "";
    a.languages = [];
    a.selectedLang = {};
    a.problems = [];
    a.editor = undefined;
    a.editorRefreshMode = function() {
        if (a.editor === undefined || a.editor === null) {
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
            if (a.selectedLang === "Java 7") {
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
    };
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
    };
    a.loadContestLanguage = function() {
        d.post("/submission/view/language/" + c.contestId).success(function(f) {
            a.languages = f;
            a.selectedLang = a.languages[0];
            a.getLangCookie()
        }).error(function(f) {
            console.log("error");
            console.log(f)
        })
    };
    a.loadContestProblem = function() {
        d.post("/problem/contest/" + c.contestId).success(function(g) {
            a.problems = g;
            if (a.problems !== null && a.problems !== undefined && a.problems !== "") {
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
    };
    a.setLangCookie = function(f) {
        b.setCookie("selectedLang", f, (1000 * 60 * 60 * 24 * 365), "")
    };
    a.getLangCookie = function() {
        var g = b.getCookie("selectedLang");
        if (g !== undefined) {
            var f = a.languages.indexOf(g);
            a.selectedLang = a.languages[f]
        }
    };
    a.submit = function(h) {
        var f = "/submission/submit/" + h;
        if (a.selectedLang === null || a.selectedLang === "" || a.selectedLang === undefined) {
            a.msg = "Please choose language";
            return
        }
        if (a.file === undefined || a.file === null) {
            a.solutionText = a.editor.getValue()
        }
        if ((a.file === undefined || a.file === null) && (a.solutionText === undefined || a.solutionText === null || a.solutionText === "")) {
            a.msg = "No file chosen and editor is empty";
            return
        }
        a.msg = "Uploading...";
        if (a.file === undefined || a.file === null) {
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
    };
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
    };
    a.setMsgOnChange = function() {
        a.msg = ""
    }
}]).controller("SubmissionToolsCtrl", ["$scope", "$http", "$location", "$sce", "$routeParams", "Helper", function(b, f, e, a, d, c) {
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
}]).controller("SubmissionViewCtrl", ["$scope", "$http", "$location", "$sce", "$routeParams", "Helper", "UserDataSvc", "ownSubmitBg", "$interval", function(h, e, b, f, g, c, a, i, d) {
    h.addHoverCard_username = addHoverCard_username;
    h.removeHoverCard = removeHoverCard;
    h.sterilizeUsername = c.sterilizeUsername;
    h.currPageNum = 1;
    h.submissions = [];
    h.submissionData = {};
    h.userDataShared = {};
    h.reconnectSubmissionSocketTimeout = undefined;
    h.reconnectContestSubmissionSocketTimeout = undefined;
    h.stompClient = undefined;
    h.socket = undefined;
    h.currPageNum = 1;
    h.numOfSubmission = 30;
    h.submissionCount = 0;
    h.totalPage = 0;
    h.pages = {};
    h.hasSpecialPrivilegeInContest = false;
    h.contestSubmissionFilter = {
        active: false
    };
    h.currentTime = null;
    h.currentTimePromise = null;
    h.$watch(function() {
        return a.getData()
    }, function() {
        h.userDataShared = a.getData();
        h.checkHasSpecialPrivilegeInContest()
    });
    h.$on("$routeChangeStart", function(j, k) {
        if (h.currentTimePromise !== null) {
            d.cancel(h.currentTimePromise)
        }
    });
    h.getSubmissionLink = function(j, k) {
        return (j !== undefined) ? "/submission/view/" + k : undefined
    };
    h.getContestSubmissionLink = function(k, l, j) {
        return ((k !== undefined) || (j === true)) ? "/user/contest/" + g.contestId + "/submission/" + l : undefined
    };
    h.checkHasSpecialPrivilegeInContest = function() {
        if (a.getData() !== undefined && g.contestId !== null && g.contestId !== undefined) {
            var j = {
                contestId: g.contestId
            };
            e.post("/announcement/contest/special/check", j).success(function(k) {
                h.hasSpecialPrivilegeInContest = k;
                h.populateContestSubmission()
            }).error(function(k) {
                console.log("error");
                console.log(k)
            })
        }
    };
    h.parseSubmitTime = function(k) {
        var j = h.currentTime - k;
        if (j < 60000) {
            return (Math.floor(j / 1000)) + " seconds ago"
        } else {
            if (j < 3600000) {
                return (Math.floor(j / 60000)) + " minutes ago"
            } else {
                return (Math.floor(j / 3600000)) + " hours ago"
            }
        }
    };
    h.populateSubmission = function() {
        e.post("/submission/view/").success(function(k) {
            h.submissions = k;
            if (h.submissions !== undefined && h.submissions !== null && h.submissions !== "") {
                h.submissions.forEach(function(l) {
                    if (h.userDataShared !== undefined && l.userId === h.userDataShared.userId) {
                        l.backgroundColor = i
                    }
                    l.verdictDescription = c.getVerdictDescription(l.verdict)
                })
            }
            h.connect(); // TODO: connect socket
        }).error(function(j) {
            console.log("error : " + j)
        })
    };
    h.prevPage = function() {
        if (h.currPageNum > 1) {
            h.currPageNum--;
            h.populateContestSubmission()
        }
    };
    h.nextPage = function() {
        if (h.currPageNum < h.totalPage) {
            h.currPageNum++;
            h.populateContestSubmission()
        }
    };
    h.populateFilteredContestSubmission = function(j) {
        if (j) {
            h.currPageNum = 1
        }
        h.contestSubmissionFilter.active = true;
        if (h.userDataShared !== undefined) {
            h.connectContest();
            if (h.contestSubmissionFilter.username === undefined || h.contestSubmissionFilter.username === null) {
                h.contestSubmissionFilter.username = ""
            }
            if (h.contestSubmissionFilter.problemName === undefined || h.contestSubmissionFilter.problemName == null) {
                h.contestSubmissionFilter.problemName = ""
            }
            if (h.contestSubmissionFilter.language === undefined || h.contestSubmissionFilter.language === null) {
                h.contestSubmissionFilter.language = ""
            }
            if (h.contestSubmissionFilter.verdict === undefined || h.contestSubmissionFilter.verdict === null) {
                h.contestSubmissionFilter.verdict = ""
            }
            e.post("/submission/view/contest/filter/" + g.contestId + "/" + h.currPageNum, h.contestSubmissionFilter).success(function(k) {
                h.submissions = k;
                if (h.userDataShared !== undefined) {
                    if (h.submissions !== null && h.submissions !== undefined && h.submissions !== "") {
                        h.submissions.forEach(function(l) {
                            if (l.userId === h.userDataShared.userId) {
                                l.backgroundColor = i
                            }
                            l.verdictDescription = c.getVerdictDescription(l.verdict)
                        })
                    }
                }
            }).error(function(k) {
                console.log("error");
                console.log(k)
            });
            e.post("/submission/view/contest/count/filter/" + g.contestId, h.contestSubmissionFilter).success(function(k) {
                h.submissionCount = k;
                h.totalPage = Math.ceil(h.submissionCount / h.numOfSubmission);
                h.pages = c.getPageArr(h.currPageNum, h.totalPage)
            }).error(function(k) {
                console.log("error: ");
                console.log(k)
            })
        }
    };
    h.populateContestSubmission = function(j) {
        if (j !== undefined && !isNaN(j)) {
            h.currPageNum = j
        }
        if (h.contestSubmissionFilter.active === true) {
            h.populateFilteredContestSubmission();
            return
        }
        if (h.userDataShared !== undefined) {
            h.connectContest();
            e.post("/submission/view/contest/" + g.contestId + "/" + h.currPageNum).success(function(k) {
                h.submissions = k;
                if (h.userDataShared !== undefined) {
                    if (h.submissions !== null && h.submissions !== undefined && h.submissions !== "") {
                        h.submissions.forEach(function(l) {
                            if (l.userId === h.userDataShared.userId) {
                                l.backgroundColor = i
                            }
                            l.verdictDescription = c.getVerdictDescription(l.verdict)
                        })
                    }
                }
            }).error(function(k) {
                console.log("error");
                console.log(k)
            });
            e.post("/submission/view/contest/count/" + g.contestId).success(function(k) {
                h.submissionCount = k;
                h.totalPage = Math.ceil(h.submissionCount / h.numOfSubmission);
                h.pages = c.getPageArr(h.currPageNum, h.totalPage)
            }).error(function(k) {
                console.log("error: ");
                console.log(k)
            })
        }
    };
    h.$on("$routeChangeStart", function(j, k) {
        clearTimeout(h.reconnectSubmissionSocketTimeout);
        clearTimeout(h.reconnectContestSubmissionSocketTimeout);
        if (h.stompClient !== undefined && h.stompClient.connected) {
            h.stompClient.disconnect()
        }
    });
    h.connect = function() {
        h.socket = new SockJS((b.host() === "localhost") ? "https://localhost:8443/websocket/general/endpoint" : "https://jollybeeoj.com/websocket/general/endpoint");
        h.stompClient = Stomp.over(h.socket);
        h.stompClient.debug = null;
        var k = function(l) {
            if (h.userDataShared !== undefined && l.userId === h.userDataShared.userId) {
                l.backgroundColor = i
            }
            l.verdictDescription = c.getVerdictDescription(l.verdict);
            h.submissions.unshift(l);
            if (h.submissions.length > 30) {
                h.submissions.pop()
            }
        };
        var j = function(l) {
            for (idx in h.submissions) {
                if (h.submissions[idx].submissionId === l.submissionId) {
                    h.submissions[idx].runtime = l.runtime;
                    h.submissions[idx].verdict = l.verdict;
                    h.submissions[idx].memory = l.memory;
                    h.submissions[idx].verdictColor = l.verdictColor;
                    h.submissions[idx].verdictDescription = c.getVerdictDescription(h.submissions[idx].verdict);
                    break
                }
            }
        };
        h.stompClient.connect({}, function(l) {
            h.stompClient.subscribe("/websocket/subscribe/submission/live", function(m) {
                k(JSON.parse(m.body));
                h.$digest()
            });
            h.stompClient.subscribe("/websocket/subscribe/submission/live/update", function(m) {
                j(JSON.parse(m.body));
                h.$digest()
            })
        }, function(l) {
            h.reconnectSubmissionSocketTimeout = setTimeout(function() {
                h.connect()
            }, 10000)
        })
    };
    h.connectContest = function() {
        if (h.stompClient !== undefined && h.stompClient.connected) {
            return
        }
        h.socket = new SockJS((b.host() === "localhost") ? "https://localhost:8443/websocket/general/endpoint" : "https://jollybeeoj.com/websocket/general/endpoint");
        h.stompClient = Stomp.over(h.socket);
        h.stompClient.debug = null;
        h.stompClient.connect(null, null, function(l) {
            var k = "/websocket/subscribe/contest/submission/live/" + g.contestId + ((h.hasSpecialPrivilegeInContest === true) ? ("") : ("/" + h.userDataShared.userId));
            var j = "/websocket/subscribe/contest/submission/live/update/" + g.contestId + ((h.hasSpecialPrivilegeInContest === true) ? ("") : ("/" + h.userDataShared.userId));
            h.stompClient.subscribe(k, function(m) {
                m = JSON.parse(m.body);
                if (m.userId === h.userDataShared.userId) {
                    m.backgroundColor = i
                }
                m.verdictDescription = c.getVerdictDescription(m.verdict);
                if (h.submissions === undefined || h.submissions === null || h.submissions === "") {
                    h.submissions = []
                }
                if (h.contestSubmissionFilter.active === true) {
                    if (h.contestSubmissionFilter.username !== undefined && h.contestSubmissionFilter.username !== null && h.contestSubmissionFilter.username !== "" && m.username.indexOf(h.contestSubmissionFilter.username) === -1) {
                        return
                    }
                    if (h.contestSubmissionFilter.problemName !== undefined && h.contestSubmissionFilter.problemName !== null && h.contestSubmissionFilter.problemName !== "" && m.problemName.indexOf(h.contestSubmissionFilter.problemName) === -1) {
                        return
                    }
                    if (h.contestSubmissionFilter.language !== undefined && h.contestSubmissionFilter.language !== null && h.contestSubmissionFilter.language !== "" && m.language.indexOf(h.contestSubmissionFilter.language) === -1) {
                        return
                    }
                    if (h.contestSubmissionFilter.verdict !== undefined && h.contestSubmissionFilter.verdict !== null && h.contestSubmissionFilter.verdict !== "" && m.verdict.indexOf(h.contestSubmissionFilter.verdict) === -1) {
                        return
                    }
                }
                if (h.currPageNum === 1) {
                    h.submissions.unshift(m)
                }
                if (h.submissions.length > 30) {
                    h.submissions.pop()
                }
                h.$digest()
            });
            h.stompClient.subscribe(j, function(m) {
                m = JSON.parse(m.body);
                for (idx in h.submissions) {
                    if (h.submissions[idx].submissionId === m.submissionId) {
                        h.submissions[idx].runtime = m.runtime;
                        h.submissions[idx].verdict = m.verdict;
                        h.submissions[idx].memory = m.memory;
                        h.submissions[idx].verdictColor = m.verdictColor;
                        h.submissions[idx].verdictDescription = c.getVerdictDescription(h.submissions[idx].verdict);
                        break
                    }
                }
                h.$digest()
            })
        }, function(j) {
            h.reconnectContestSubmissionSocketTimeout = setTimeout(function() {
                h.connectContest()
            }, 10000)
        })
    };
    h.parseToHTML = function(j) {
        return c.parseToHTML(f, j)
    };
    h.populateSubmissionDetail = function() {
        e.post("/submission/view/" + g.submissionId).success(function(j) {
            h.submissionData = j;
            h.submissionData.verdictDescription = c.getVerdictDescription(h.submissionData.verdict);
            setTimeout(function() {
                Prism.highlightAll()
            }, 10)
        }).error(function(j) {
            console.log("error:");
            console.log(j)
        })
    };
    h.populateContestSubmissionDetail = function() {
        e.post("/submission/view/detail/contest/" + g.submissionId + "/" + g.contestId).success(function(j) {
            h.submissionData = j;
            h.submissionData.verdictDescription = c.getVerdictDescription(h.submissionData.verdict);
            setTimeout(function() {
                Prism.highlightAll()
            }, 10)
        }).error(function(j) {
            console.log("error:");
            console.log(j)
        })
    };
    h.contestProblemPath = function(j) {
        return "/user/contest/" + g.contestId + "/problem/" + j
    }
}]);
angular.module("userModule", ["helperModule", "navModule", "ui.bootstrap"]).service("UserDataSvc", [function() {
    var a = {};
    var b = {};
    this.setNotification = function(c) {
        this.notification = c
    };
    this.getNotification = function() {
        return this.notification
    };
    this.setData = function(c) {
        this.userDataShared = c;
        console.log("userDataShared: ", this.userDataShared);
    };
    this.getData = function() {
        return this.userDataShared
    }
}]).filter("powerIsNotAddedIn", function() {
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
}]).controller("UserCtrl", ["$scope", "$http", "$location", "$routeParams", "Helper", "UserDataSvc", "$sce", "$q", function(c, h, g, e, d, f, a, b) {
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
    };
    c.parseToHTML = function(i) {
        return d.parseToHTML(a, i)
    };
    c.parseDateReadable = function(i) {
        if (i) {
            var j = new Date(i);
            return ("0" + j.getDate()).slice(-2) + "-" + c.monthNames[j.getMonth()] + "-" + j.getFullYear() + " " + ("0" + j.getHours()).slice(-2) + ":" + ("0" + j.getMinutes()).slice(-2) + ":" + ("0" + j.getSeconds()).slice(-2)
        }
    };
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
    };
    c.authoring.get = function() {
        h.post("/user/authoring/get").success(function(k) {
            if (k !== "null" && k !== null) {
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
    };
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
    };
    c.authoring.update = function() {
        var i = new FormData();
        c.authoring.msg = "All fields must be filled with correct values";
        if (c.authoring.detail.title === undefined || c.authoring.detail.title === null) {
            return
        }
        if (c.authoring.detail.memoryLimit === undefined || c.authoring.detail.memoryLimit === null) {
            return
        }
        if (c.authoring.detail.timeLimit === undefined || c.authoring.detail.timeLimit === null) {
            return
        }
        if (c.authoring.detail.difficulty === undefined || c.authoring.detail.difficulty === null) {
            return
        }
        if (c.authoring.detail.problemDescription === undefined || c.authoring.detail.problemDescription === null) {
            return
        }
        if (c.authoring.detail.inputDescription === undefined || c.authoring.detail.inputDescription === null) {
            return
        }
        if (c.authoring.detail.outputDescription === undefined || c.authoring.detail.outputDescription === null) {
            return
        }
        if (c.authoring.detail.notes === undefined || c.authoring.detail.notes === null) {
            return
        }
        if (c.authoring.detail.allowedJC === undefined || c.authoring.detail.allowedJC === null) {
            return
        }
        if (c.authoring.detail.solution === undefined || c.authoring.detail.solution === null) {
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
    };
    c.authoring.repropose = function() {
        var i = new FormData();
        c.authoring.msg = "All fields must be filled with correct values";
        if (c.authoring.detail.title === undefined || c.authoring.detail.title === null) {
            return
        }
        if (c.authoring.detail.memoryLimit === undefined || c.authoring.detail.memoryLimit === null) {
            return
        }
        if (c.authoring.detail.timeLimit === undefined || c.authoring.detail.timeLimit === null) {
            return
        }
        if (c.authoring.detail.difficulty === undefined || c.authoring.detail.difficulty === null) {
            return
        }
        if (c.authoring.detail.problemDescription === undefined || c.authoring.detail.problemDescription === null) {
            return
        }
        if (c.authoring.detail.inputDescription === undefined || c.authoring.detail.inputDescription === null) {
            return
        }
        if (c.authoring.detail.outputDescription === undefined || c.authoring.detail.outputDescription === null) {
            return
        }
        if (c.authoring.detail.notes === undefined || c.authoring.detail.notes === null) {
            return
        }
        if (c.authoring.detail.allowedJC === undefined || c.authoring.detail.allowedJC === null) {
            return
        }
        if (c.authoring.detail.solution === undefined || c.authoring.detail.solution === null) {
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
    };
    c.authoring.add = function() {
        var i = new FormData();
        c.authoring.msg = "All fields must be filled with correct values";
        if (c.authoring.detail.title === undefined || c.authoring.detail.title === null) {
            return
        }
        if (c.authoring.detail.memoryLimit === undefined || c.authoring.detail.memoryLimit === null) {
            return
        }
        if (c.authoring.detail.timeLimit === undefined || c.authoring.detail.timeLimit === null) {
            return
        }
        if (c.authoring.detail.difficulty === undefined || c.authoring.detail.difficulty === null) {
            return
        }
        if (c.authoring.detail.problemDescription === undefined || c.authoring.detail.problemDescription === null) {
            return
        }
        if (c.authoring.detail.inputDescription === undefined || c.authoring.detail.inputDescription === null) {
            return
        }
        if (c.authoring.detail.outputDescription === undefined || c.authoring.detail.outputDescription === null) {
            return
        }
        if (c.authoring.detail.notes === undefined || c.authoring.detail.notes === null) {
            return
        }
        if (c.authoring.detail.allowedJC === undefined || c.authoring.detail.allowedJC === null) {
            return
        }
        if (c.authoring.detail.solution === undefined || c.authoring.detail.solution === null) {
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
    };
    c.authoring.tget = function() {
        h.post("/user/tools/authoring/get").success(function(k) {
            if (k !== null) {
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
    };
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
    };
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
    };
    c.authoring.publish = function() {
        if (confirm("Are you sure you want to publish this problem? After this problem is published, all testcases related to this problem will be deleted permanently from database")) {
            c.authoring.msg = "Processing...";
            c.authoring.isWorking = true;
            var k = prompt("Where will the problem be published? (example: 'Archive', 'Jolly Challenge #13', etc.)");
            var i = prompt("Enter the url of published problem:");
            if (k === null || i === null || k === "" || publishedUrl === "") {
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
    };
    c.authoring.getSpecific = function() {
        h.post("/user/tools/authoring/get/username", {
            username: c.authoring.specificUsername
        }).success(function(i) {
            c.authoring.data.specific = i
        }).error(function(i) {
            console.log(i)
        })
    };
    c.manageCoin.generatePageArray = function() {
        c.manageCoin.totalPage = Math.ceil(c.manageCoin.transactionHistoryCount / 10);
        c.manageCoin.pages = d.getPageArr(c.manageCoin.currentPage, c.manageCoin.totalPage)
    };
    c.manageCoin.getUserCoin = function() {
        h.post("/user/coin").success(function(i) {
            c.manageCoin.coin = i
        }).error(function(i) {
            console.log("error: " + i)
        })
    };
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
    };
    c.manageCoin.prevPage = function() {
        if (c.manageCoin.currentPage <= 1) {
            return
        }
        c.manageCoin.currentPage--;
        c.manageCoin.getUserCoinTransaction()
    };
    c.manageCoin.nextPage = function() {
        if (c.manageCoin.currentPage >= c.manageCoin.totalPage) {
            return
        }
        c.manageCoin.currentPage++;
        c.manageCoin.getUserCoinTransaction()
    };
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
    };
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
    };
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
    };
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
    };
    c.mentorship.mentor.plagiarism.waitForFinalEventGetMenteeList = function() {
        if (c.mentorship.mentor.currentPage === "plagiarism") {
            c.waitForFinalEvent(function() {
                c.mentorship.mentor.plagiarism.getMenteeList()
            }, 750, "get plagiarism mentee list")
        }
    };
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
                    if (i === "" || i === null || i === undefined) {
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
    };
    c.mentorship.mentor.waitForFinalEventGetSubmissionStatistic = function() {
        if (c.mentorship.mentor.currentPage === "statistic") {
            c.waitForFinalEvent(function() {
                c.mentorship.mentor.getSubmissionStatistic();
                c.mentorship.mentor.getDistinctAcceptedProblem();
                c.mentorship.mentor.getRatingStatistic()
            }, 750, "get submission statistic")
        }
    };
    c.mentorship.mentor.refreshSubmissionStatisticChart = function(i) {
        if (google.visualization !== undefined) {
            if (c.mentorship.mentor.submissionStatisticChart[i] === undefined || c.mentorship.mentor.submissionStatisticChart[i] === null || c.mentorship.mentor.submissionStatisticChart[i] === "") {
                if ($("#submissionStatisticChart" + i).length != 0) {
                    c.mentorship.mentor.submissionStatisticChart[i] = new google.visualization.ColumnChart(document.getElementById("submissionStatisticChart" + i))
                }
            }
            if (c.mentorship.mentor.submissionStatisticData[i] !== undefined && c.mentorship.mentor.submissionStatisticData[i] !== null && c.mentorship.mentor.submissionStatisticData[i] !== "") {
                c.mentorship.mentor.submissionStatisticChart[i].draw(google.visualization.arrayToDataTable(c.mentorship.mentor.submissionStatisticData[i]), c.globalChartOptions)
            }
        }
    };
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
                    if (i === null || i === "" || i === undefined) {
                        return
                    }
                    var s = [
                        ["Username", "Accepted", {
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
                        }]
                    ];
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
                                s = [
                                    ["Username", "Accepted", {
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
                                    }]
                                ];
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
    };
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
    };
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
                if (i === null || i === "" || i === undefined || i.length <= 0) {
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
                                    q.push(null);
                                    q.push(null)
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
    };
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
                if (i === null || i === "" || i === undefined) {
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
    };
    c.mentorship.mentor.changePage = function(i) {
        c.mentorship.mentor.currentPage = i
    };
    c.mentorship.mentee.getMentor = function() {
        h.post("/user/mentorship/mentee/mentor/get").success(function(i) {
            c.mentorship.mentee.dataMentor = i
        }).error(function(i) {
            console.log("error");
            console.log(i)
        })
    };
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
    };
    c.mentorship.mentee.waitForFinalEventGetExercise = function() {
        c.waitForFinalEvent(function() {
            c.mentorship.mentee.getExercise()
        }, 750, "get mentee exercise")
    };
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
    };
    c.mentorship.changePage = function(i) {
        c.mentorship.currentPage = i
    };
    c.mentorship.generateSlotPageArray = function() {
        c.mentorship.slotTotalPage = Math.ceil(c.mentorship.slotActiveCount / c.mentorship.slotPerPage);
        c.mentorship.slotPages = d.getPageArr(c.mentorship.slotPage, c.mentorship.slotTotalPage);
        c.mentorship.showSlot[-1] = false
    };
    c.mentorship.slotPrevPage = function() {
        if (c.mentorship.slotPage > 1) {
            c.mentorship.slotPage--
        }
        c.mentorship.getMentorshipSlot()
    };
    c.mentorship.slotNextPage = function() {
        if (c.mentorship.slotPage < c.mentorship.slotTotalPage) {
            c.mentorship.slotPage++
        }
        c.mentorship.getMentorshipSlot()
    };
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
    };
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
    };
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
    };
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
    };
    c.mentorship.waitForFinalEventGetMentorshipExercise = function() {
        c.waitForFinalEvent(function() {
            c.mentorship.getMentorshipExercise()
        }, 750, "get mentorship exercise")
    };
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
                    if (i !== "" && i != null && i !== undefined) {
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
    };
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
    };
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
    };
    c.mentorship.populateSlotPage = function(i) {
        if (isNaN(i)) {
            return
        }
        c.mentorship.slotPage = i;
        c.mentorship.getMentorshipSlot()
    };
    c.mentorship.changeAllShowSlot = function() {
        for (var i in c.mentorship.showSlot) {
            if (c.mentorship.showSlot.hasOwnProperty(i)) {
                c.mentorship.showSlot[i] = c.mentorship.showSlot[-1]
            }
        }
    };
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
    };
    c.mentorship.waitForFinalEventGetMentorshipSlot = function() {
        c.waitForFinalEvent(function() {
            c.mentorship.getMentorshipSlot()
        }, 750, "get mentorship slot")
    };
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
    };
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
            if (m != "" && m != null && m.mentorshipSlotId !== undefined && !isNaN(m.mentorshipSlotId)) {
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
    };
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
    };
    c.mentorship.addMentorshipGroup = function() {
        if (c.mentorship.addGroupData.name.length > 15) {
            c.mentorship.addGroupData.msg = "Max. 15 characters"
        }
        c.mentorship.addGroupData.isWorking = true;
        c.mentorship.addGroupData.msg = "Processing...";
        h.post("/user/mentorship/group/add", c.mentorship.addGroupData).success(function(i) {
            if (i !== null && i) {
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
    };
    c.mentorship.editMentorshipGroup = function() {
        if (c.mentorship.editGroupData.name.length > 15) {
            c.mentorship.editGroupData.msg = "Max. 15 characters"
        }
        c.mentorship.editGroupData.isWorking = true;
        c.mentorship.editGroupData.msg = "Processing...";
        h.post("/user/mentorship/group/edit", c.mentorship.editGroupData).success(function(k) {
            if (k !== null && k) {
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
    };
    c.mentorship.deleteMentorshipGroup = function(i) {
        h.post("/user/mentorship/group/delete", {
            mentorshipGroupId: c.mentorship.groupData[i].mentorshipGroupId
        }).success(function(j) {
            if (j === true) {
                c.mentorship.groupName[c.mentorship.groupData[i].mentorshipGroupId] = null;
                c.mentorship.groupData.splice(i, 1)
            }
        }).error(function(j) {
            console.log("error: " + j)
        })
    };
    c.getUserCount = function(i) {
        h.post("/user/count").success(function(j) {
            c.userCount = j;
            if (i) {
                i()
            }
        })
    };
    c.rank.generatePageArray = function() {
        c.rank.totalPage = Math.ceil(c.userCount / c.rank.rankPerPage);
        c.rank.pages = d.getPageArr(c.rank.currentPageNumber, c.rank.totalPage)
    };
    c.rank.populateData = function() {
        h.post("/user/rank/" + c.rank.currentPage, {
            pageNumber: c.rank.currentPageNumber
        }).success(function(i) {
            c.rank.data = i
        }).error(function(i) {
            console.log("error: " + i)
        })
    };
    c.rank.prevPageNumber = function() {
        if (c.rank.currentPageNumber > 1) {
            c.rank.currentPageNumber--
        }
        c.rank.generatePageArray();
        c.rank.populateData()
    };
    c.rank.nextPageNumber = function() {
        if (c.rank.currentPageNumber < c.rank.totalPage) {
            c.rank.currentPageNumber++
        }
        c.rank.generatePageArray();
        c.rank.populateData()
    };
    c.rank.changePageNumber = function(i) {
        if (isNaN(i)) {
            return
        }
        c.rank.currentPageNumber = i;
        c.rank.generatePageArray();
        c.rank.populateData()
    };
    c.rank.changePage = function(i) {
        c.rank.currentPage = i;
        c.rank.populateData()
    };
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
            if (l !== null && l !== undefined && l !== "null" && l !== "undefined" && l !== "" && l.length > 0) {
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
    };
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
    };
    c.setViewNotificationTime = function() {
        d.setCookie("view_notification_time_" + c.userDataShared.userId, c.notification.maxNotificationTime, 30 * 24 * 60 * 60 * 1000, "");
        c.notification.unread = 0
    };
    c.notificationRedirect = function(i) {
        g.path(i)
    };
    c.getAutocompleteUsername = function(i) {
        return h.post("/user/autocomplete", {
            pattern: i
        }).then(function(j) {
            return j.data
        })
    };
    c.searchUsername = function() {
        if ($("#searchUsernameInput").val().length >= 3) {
            g.path("/user/view/" + $("#searchUsernameInput").val())
        }
    };
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
        if (j === "" || j === undefined || j === null) {
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
                if (k === null || k === "" || k === undefined || k.length === 0) {
                    return
                } else {
                    i = true;
                    c.updateSubmissionStatisticChart(j, k, null)
                }
            }).error(function(k) {
                console.log("Error: " + k);
                c.isWorking = false
            }), h.post("/user/statistic/rating", {
                username: j
            }).success(function(k) {
                if (k !== null && k !== "" && k !== undefined && k.length !== 0) {
                    i = true;
                    c.updateRatingStatisticChart(j, k, null)
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
    };
    c.deleteCompareStatisticUsername = function(i) {
        c.updateSubmissionStatisticChart(null, null, c.compareStatisticUsernameList[i]);
        c.updateRatingStatisticChart(null, null, c.compareStatisticUsernameList[i]);
        c.compareStatisticUsernameList.splice(i, 1)
    };
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
    };
    c.getSubmissionStatistic = function() {
        var i = e.username;
        h.post("/submission/statistic/user/u/" + i).success(function(l) {
            if (l !== null && l !== undefined && l !== "" && l.length) {
                var j = [
                    ["Verdict", c.userData.username, {
                        role: "style"
                    }]
                ];
                for (var k = 0; k < l.length; k++) {
                    j.push([l[k].verdictDisplayName, l[k].count, "fill-opacity:0.65; color:" + l[k].verdictColor])
                }
                c.submissionStatisticData = j;
                c.refreshSubmissionStatisticChart()
            }
        }).error(function(j) {
            console.log("error:" + j)
        })
    };
    c.getRatingStatistic = function() {
        var i = e.username;
        h.post("/user/statistic/rating", {
            username: i
        }).success(function(n) {
            if (n !== null && n !== undefined && n !== "" && n.length > 0) {
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
    };
    c.updateSubmissionStatisticChart = function(l, p, u) {
        if (l !== null && l !== "" && l !== undefined && p !== null && p !== "" && p !== undefined) {
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
        if (u !== null && u !== "" && u !== undefined) {
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
    };
    c.updateRatingStatisticChart = function(k, q, y) {
        if (k !== null && k !== "" && k !== undefined && q !== null && q !== "" && q !== undefined) {
            if (c.ratingStatisticRawData === undefined) {
                c.ratingStatisticRawData = {}
            }
            c.ratingStatisticRawData[q[0].username] = q
        }
        if (y !== null && y !== "" && y !== undefined) {
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
                        n.push(null);
                        n.push(null)
                    }
                }
            }
            v.addRow(n)
        }
        c.ratingStatisticData = v
    };
    c.refreshSubmissionStatisticChart = function() {
        if (google.visualization !== undefined) {
            if (c.submissionStatisticChart === undefined) {
                if ($("#submissionStatisticChart").length != 0) {
                    c.submissionStatisticChart = new google.visualization.ColumnChart(document.getElementById("submissionStatisticChart"))
                }
            }
            if (c.submissionStatisticData !== undefined && c.submissionStatisticData !== null && c.submissionStatisticData !== "") {
                c.submissionStatisticChart.draw(google.visualization.arrayToDataTable(c.submissionStatisticData), c.globalChartOptions)
            }
        }
    };
    c.refreshRatingStatisticChart = function() {
        if (google.visualization !== undefined) {
            if (c.ratingStatisticChart === undefined) {
                if ($("#ratingStatisticChart").length != 0) {
                    c.ratingStatisticChart = new google.visualization.LineChart(document.getElementById("ratingStatisticChart"))
                }
            }
            if (c.ratingStatisticData !== undefined && c.ratingStatisticData !== null && c.ratingStatisticData !== "") {
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
    };
    c.archiveSubmission.nextPage = function() {
        if (c.archiveSubmission.currentPage < c.archiveSubmission.totalPage) {
            c.archiveSubmission.currentPage++;
            c.populateUserArchiveSubmission()
        }
    };
    c.archiveSubmission.prevPage = function() {
        if (c.archiveSubmission.currentPage > 1) {
            c.archiveSubmission.currentPage--;
            c.populateUserArchiveSubmission()
        }
    };
    c.populateUserArchiveSubmission = function(i) {
        if (i !== null && i !== undefined && !isNaN(i)) {
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
            if (c.archiveSubmission.data !== undefined && c.archiveSubmission.data !== null && c.archiveSubmission.data !== "") {
                c.archiveSubmission.data.forEach(function(k) {
                    if (c.userDataShared !== undefined && k.userId === c.userDataShared.userId) {
                        k.link = "/submission/view/" + k.submissionId;
                        k.backgroundColor = "#FFE3B3"
                    }
                    k.verdictDescription = d.getVerdictDescription(k.verdict)
                })
            }
        }).error(function(j) {
            console.log("error : " + j)
        })
    };
    c.editProfile = function() {
        c.isWorking = true;
        c.profileSettings.msg = "Processing...";
        var k = new FormData();
        for (var j in c.profileSettings) {
            if (c.profileSettings[j] !== undefined && c.profileSettings[j] !== null && c.profileSettings[j] !== "") {
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
    };
    c.getProfilePicture = function(i) {
        h.get("/user/profile/picture/" + i).success(function(j) {
            console.log(j)
        })
    };
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
    };
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
    };
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
    };
    c.hasHiddenProblem = function() {
        h.post("/problem/check/hidden").success(function(i) {
            if (c.userDataShared) {
                c.userDataShared.hasPower = c.userDataShared.hasPower || i
            }
        }).error(function(i) {
            console.log("error");
            console.log(i)
        })
    };
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
                        if (k.status === "success") {
                            c.checkLogin()
                        } else {
                            if (k.status == "failed") {
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
    };
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
                        c.msg = k.status == "success" ? "Success. You can login now!" : k.data;
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
    };
    c.logout = function() {
        h.post("/user/logout").success(function() {
            f.setData(undefined);
            g.path("/user/login")
        }).error(function(i) {
            console.log("error : " + i)
        })
    };
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
    };
    c.toCamelCase = function(i) {
        return d.toCamelCase(i)
    };
    c.clearMsgAndToggleFlip = function() {
        c.msg = "";
        if (c.loginView === "login") {
            c.loginView = "register"
        } else {
            c.loginView = "login"
        }
    };
    c.getUserDataById = function() {
        h.post("/user/view/" + e.username).success(function(i) {
            if (i === null || i === undefined || i === "") {
                g.path("/")
            }
            c.userData = i;
            c.profileSettings.email = c.userData.email;
            c.profileSettings.name = c.userData.name;
            c.loadAllCharts();
            c.populateUserArchiveSubmission();
            c.getBadges()
        }).error(function(i) {
            console.log("error");
            console.log(i)
        })
    }
}]).controller("UserToolsCtrl", ["$scope", "$http", "Helper", "$sce", function(b, d, c, a) {
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
    };
    $("#usernameManageCoin").keyup(function(e) {
        if (e.keyCode === 13) {
            b.manageCoin.getUserCoin();
            b.manageCoin.getUserCoinTransaction()
        }
    });
    b.manageCoin.generatePageArray = function() {
        b.manageCoin.totalPage = Math.ceil(b.manageCoin.transactionHistoryCount / 10);
        b.manageCoin.pages = c.getPageArr(b.manageCoin.currentPage, b.manageCoin.totalPage)
    };
    b.manageCoin.getUserCoin = function() {
        d.post("/user/tools/coin", {
            reqUsername: b.manageCoin.currentUsername
        }).success(function(e) {
            b.manageCoin.coin = e;
            b.manageCoin.coinUsername = b.manageCoin.currentUsername
        }).error(function(e) {
            console.log("error: " + e)
        })
    };
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
    };
    b.manageCoin.prevPage = function() {
        if (b.manageCoin.currentPage <= 1) {
            return
        }
        b.manageCoin.currentPage--;
        b.manageCoin.getUserCoinTransaction()
    };
    b.manageCoin.nextPage = function() {
        if (b.manageCoin.currentPage >= b.manageCoin.totalPage) {
            return
        }
        b.manageCoin.currentPage++;
        b.manageCoin.getUserCoinTransaction()
    };
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
    };
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
    };
    b.viewRegisteredUser = function() {
        if (b.userData.contestId !== null && b.userData.contestId !== undefined && b.userData.contestId !== "") {
            d.post("/user/tools/contest/view/batch", {
                contestId: b.userData.contestId
            }).success(function(f) {
                if (f == null) {
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
    };
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
    };
    b.registerBatchUser = function() {
        b.isWorking = true;
        b.msgRegister = "Processing...";
        b.userData.username = [];
        b.userData.name = [];
        b.userData.description = [];
        b.userData.password = [];
        b.userData.plainPassword = [];
        var e = b.userData.registerText.split("\n");
        if (e === null || e === undefined || e.length === 0) {
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
        if (b.userData.contestId === null || b.userData.contestId === undefined || b.userData.contestId === "") {
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
    };
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
                if (b.registeredUserData[f].name === "" || b.registeredUserData[f].name === undefined || b.registeredUserData[f].name === null) {
                    b.userData.name.push(" ")
                } else {
                    b.userData.name.push(b.registeredUserData[f].name)
                }
                if (b.registeredUserData[f].description === "" || b.registeredUserData[f].description === undefined || b.registeredUserData[f].description === null) {
                    b.userData.description.push(" ")
                } else {
                    b.userData.description.push(b.registeredUserData[f].description)
                }
                if (b.registeredUserData[f].plainPassword === "" || b.registeredUserData[f].plainPassword === null || b.registeredUserData[f].plainPassword === undefined) {
                    b.userData.plainPassword.push("")
                } else {
                    b.userData.plainPassword.push(b.registeredUserData[f].plainPassword.replace(/\s/g, ""))
                }
            }
        }
        for (var f = 0; f < b.userData.plainPassword.length; f++) {
            if (b.userData.plainPassword[f] === "" || b.userData.plainPassword[f] === undefined || b.userData.plainPassword[f] === null) {
                b.userData.password.push("")
            } else {
                var g = CryptoJS.SHA3(b.userData.plainPassword[f]);
                b.userData.password.push(String(g));
                b.registeredUserDataPlainP[b.userData.username[f]] = b.userData.plainPassword[f]
            }
        }
        if (b.userData.contestId === null || b.userData.contestId === undefined || b.userData.contestId === "") {
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
    };
    b.getAutocompleteUsername = function(e) {
        return d.post("/user/autocomplete", {
            pattern: e
        }).then(function(f) {
            return f.data
        })
    };
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
    };
    b.deleteUserFromRoleList = function(f, e) {
        b.users[f].splice(e, 1)
    };
    b.addUserToRoleList = function(e, f) {
        if (b.autocomplete[e] === "" || f.keyCode !== 13) {
            return
        }
        if ($.inArray(b.autocomplete[e], b.users[e]) === -1) {
            b.users[e].push(b.autocomplete[e])
        }
        b.autocomplete[e] = ""
    };
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
    };
    b.loadRoles = function() {
        d.post("/user/tools/data/role").success(function(e) {
            b.roles = e
        }).error(function(e) {
            console.log("error");
            console.log(e)
        })
    };
    b.loadRolePowerByRoleId = function(e) {
        d.post("/user/tools/data/power_role", {
            roleId: e
        }).success(function(f) {
            b.powerList = f
        }).error(function(f) {
            console.log("error");
            console.log(f)
        })
    };
    b.loadAvailableRolePower = function() {
        d.post("/user/tools/data/power").success(function(e) {
            b.rolePowers = e
        }).error(function(e) {
            console.log("error");
            console.log(e)
        })
    };
    b.isEmptyObject = function(e) {
        return c.isEmptyObject(e)
    };
    b.moveRolePowerToList = function(g, f, e) {
        if (!b.powerList.hasOwnProperty(g)) {
            b.powerList[g] = {}
        }
        b.powerList[g][f] = e
    };
    b.deleteRolePowerFromList = function(g, f, e) {
        delete b.powerList[g][f];
        if (b.isEmptyObject(b.powerList[g])) {
            delete b.powerList[g]
        }
    };
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
    };
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
}]);