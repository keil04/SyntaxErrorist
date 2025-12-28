
(function($){
  "use strict";

  function escapeHtml(str){
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  $(document).ready(function(){

    var $back = $("#backToTop");
    if ($back.length){
      $(window).on("scroll", function(){
        if ($(this).scrollTop() > 280){
          $back.addClass("show");
        } else {
          $back.removeClass("show");
        }
      });

      $back.on("click", function(){
        $("html, body").animate({ scrollTop: 0 }, 350);
      });
    }

    
    if (typeof bootstrap !== "undefined"){
      var tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipEls.forEach(function(el){
        try { new bootstrap.Tooltip(el); } catch(e) {}
      });
    }

   
    $(".collapse").on("show.bs.collapse", function(){
      var id = this.id;
      var $toggles = $('[data-bs-target="#'+id+'"], [href="#'+id+'"]');
      $toggles.each(function(){
        var $t = $(this);
        var hideLabel = $t.data("label-hide");
        if (hideLabel){ $t.text(hideLabel); }
      });
    });

    $(".collapse").on("hide.bs.collapse", function(){
      var id = this.id;
      var $toggles = $('[data-bs-target="#'+id+'"], [href="#'+id+'"]');
      $toggles.each(function(){
        var $t = $(this);
        var showLabel = $t.data("label-show");
        if (showLabel){ $t.text(showLabel); }
      });
    });

    
    if ($("#blogList").length){
      var STORAGE_KEY = "rampage_stories_v1";

      function getStories(){
        try {
          var raw = localStorage.getItem(STORAGE_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch (e){ return []; }
      }

      function setStories(stories){
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stories)); } catch(e) {}
      }

      function catLabel(category){
        return (category === "campus") ? "Campus" : (category === "study") ? "Study" : "Art";
      }

      function badgeClass(category){
        return (category === "campus") ? "badge-campus" : (category === "study") ? "badge-study" : "badge-art";
      }

      function formatDate(iso){
        try { return new Date(iso).toLocaleDateString(); } catch(e){ return ""; }
      }

      function storyCardHtml(story){
        var collapseId = "story_" + story.id;

        var imgHtml = "";
        if (story.image){
          imgHtml =
            '<div class="mt-3" style="height:160px;border-radius:10px;overflow:hidden;border:2px solid rgba(244,208,63,0.35);">' +
              '<img src="'+escapeHtml(story.image)+'" alt="" style="width:100%;height:100%;object-fit:cover;">' +
            '</div>';
        }

        return (
          '<div class="col-md-6 blog-card" data-category="'+escapeHtml(story.category)+'" data-origin="user" data-id="'+escapeHtml(story.id)+'" data-created="'+escapeHtml(story.createdAt)+'">' +
            '<article class="card-clean p-4 h-100 d-flex flex-column">' +
              '<div class="d-flex justify-content-between align-items-start gap-3">' +
                '<h3 class="mb-0">'+escapeHtml(story.title)+'</h3>' +
                '<span class="badge-pill '+badgeClass(story.category)+'">'+escapeHtml(catLabel(story.category))+'</span>' +
              '</div>' +
              '<div class="story-meta mt-1">By '+escapeHtml(story.author)+' • '+escapeHtml(formatDate(story.createdAt))+'</div>' +
              '<p class="text-muted-weak mt-2 mb-3">'+escapeHtml(story.excerpt)+'</p>' +
              '<div class="mt-auto d-flex align-items-center justify-content-between gap-2 flex-wrap">' +
                '<button class="btn-primary-custom" type="button" data-bs-toggle="collapse" data-bs-target="#'+collapseId+'" aria-expanded="false" aria-controls="'+collapseId+'" data-label-show="Read More" data-label-hide="Show Less">Read More</button>' +
                '<div class="d-flex gap-2">' +
                  '<button class="like-btn js-like" type="button" aria-label="Like this story">' +
                    '<i class="fa-solid fa-heart" aria-hidden="true"></i> ' +
                    '<span class="js-like-count">'+escapeHtml(story.likes || 0)+'</span>' +
                  '</button>' +
                  '<button class="btn-gold-outline js-delete" type="button" aria-label="Delete this story">' +
                    '<i class="fa-solid fa-trash" aria-hidden="true"></i>' +
                  '</button>' +
                '</div>' +
              '</div>' +
              '<div class="collapse mt-3" id="'+collapseId+'">' +
                '<div class="mb-2">'+escapeHtml(story.body)+'</div>' +
                imgHtml +
              '</div>' +
            '</article>' +
          '</div>'
        );
      }

      function renderStories(){
        $('#blogList .blog-card[data-origin="user"]').remove();

        var stories = getStories();
        var sortMode = $("#blogSort").val() || "newest";
        stories.sort(function(a,b){
          var da = new Date(a.createdAt).getTime();
          var db = new Date(b.createdAt).getTime();
          return sortMode === "oldest" ? (da - db) : (db - da);
        });

        for (var i=0; i<stories.length; i++){
          $("#blogList").prepend(storyCardHtml(stories[i]));
        }

        applyFilters();
      }

      function applyFilters(){
        var cat = $(".js-blog-filter.active").data("category") || "all";
        var q = ($("#blogSearch").val() || "").trim().toLowerCase();

        $(".blog-card").each(function(){
          var $card = $(this);
          var c = $card.data("category");
          var text = $card.text().toLowerCase();
          var matchCat = (cat === "all") || (c === cat);
          var matchQ = (!q) || (text.indexOf(q) !== -1);

          if (matchCat && matchQ){
            $card.show();
          } else {
            $card.hide();
          }
        });

        var visibleCount = $(".blog-card:visible").length;
        $("#blogCount").val(visibleCount + (visibleCount === 1 ? " post" : " posts"));
      }

      $(".js-blog-filter").on("click", function(){
        var cat = $(this).data("category");
        $(".js-blog-filter").removeClass("active");
        $(this).addClass("active");
        applyFilters();
      });

      $("#blogSearch").on("input", applyFilters);
      $("#blogSort").on("change", renderStories);

      function updateStoryPreview(){
        var title = $("#storyTitle").val().trim();
        var author = $("#storyAuthor").val().trim();
        var body = $("#storyBody").val();
        $("#storyChars").text(String(body.length));

        $("#storyPreviewTitle").text(title || "Your title");
        $("#storyPreviewMeta").text("By " + (author || "you") + " • Today");
        $("#storyPreviewText").text(body || "Your story preview will appear here...");
      }

      $("#storyTitle, #storyAuthor, #storyBody").on("input", updateStoryPreview);
      updateStoryPreview();

      $("#fillStoryDemo").on("click", function(){
        $("#storyTitle").val("A golden moment on campus");
        $("#storyAuthor").val("Student Writer");
        $("#storyCategory").val("campus");
        $("#storyBody").val("Today our class hosted a mini exhibit in the hallway—everyone stopped to look and share feedback. The best part was seeing new artists get confident in their work.");
        updateStoryPreview();
      });

      $("#storyForm").on("submit", function(e){
        e.preventDefault();
        e.stopPropagation();

        var form = this;
        if (form.checkValidity && !form.checkValidity()){
          $(form).addClass("was-validated");
          return;
        }
        $(form).addClass("was-validated");

        var title = $("#storyTitle").val().trim();
        var category = $("#storyCategory").val();
        var author = $("#storyAuthor").val().trim();
        var image = $("#storyImage").val().trim();
        var body = $("#storyBody").val().trim();
        var excerpt = body.length > 120 ? (body.slice(0, 117) + "...") : body;

        var story = {
          id: String(Date.now()),
          title: title,
          category: category,
          author: author,
          image: image,
          body: body,
          excerpt: excerpt,
          likes: 0,
          createdAt: (new Date()).toISOString()
        };

        var stories = getStories();
        stories.push(story);
        setStories(stories);

        $("#storyTitle").val("");
        $("#storyAuthor").val("");
        $("#storyImage").val("");
        $("#storyBody").val("");
        $(form).removeClass("was-validated");
        updateStoryPreview();

        var modalEl = document.getElementById("storyModal");
        if (modalEl && typeof bootstrap !== "undefined"){
          try { bootstrap.Modal.getOrCreateInstance(modalEl).hide(); } catch(e) {}
        }

        var toastEl = document.getElementById("blogToast");
        if (toastEl && typeof bootstrap !== "undefined"){
          try { new bootstrap.Toast(toastEl).show(); } catch(e) {}
        }

        renderStories();
      });

      $("#blogList").on("click", ".js-like", function(){
        var $btn = $(this);
        var $card = $btn.closest(".blog-card");
        var id = $card.data("id");

        var stories = getStories();
        for (var i=0; i<stories.length; i++){
          if (stories[i].id === String(id)){
            stories[i].likes = (stories[i].likes || 0) + 1;
            setStories(stories);
            $btn.find(".js-like-count").text(String(stories[i].likes));
            $btn.addClass("is-liked");
            break;
          }
        }
      });

      $("#blogList").on("click", ".js-delete", function(){
        var $card = $(this).closest(".blog-card");
        var id = $card.data("id");
        var stories = getStories().filter(function(s){ return s.id !== String(id); });
        setStories(stories);
        $card.remove();
        applyFilters();
      });

      $("#clearSavedStories").on("click", function(){
        setStories([]);
        renderStories();
      });

      renderStories();
    }

    
    if ($(".gallery-tile-btn").length){
      $(".gallery-tile-btn").on("click", function(){
        var $tile = $(this);
        var title = $tile.data("title") || "Artwork";
        var img = $tile.data("img") || "";
        var desc = $tile.data("desc") || "";

        $(".gallery-tile").removeClass("is-selected");
        $tile.addClass("is-selected");

        $("#galleryModalLabel").text(title);
        $("#galleryModalImg").attr("src", img).attr("alt", title);
        $("#galleryModalDesc").text(desc);

        if ($("#galleryHero").length && img){
          $("#galleryHero")
            .attr("aria-label", "Featured artwork: " + title)
            .html('<img src="'+escapeHtml(img)+'" alt="'+escapeHtml(title)+'" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">');
        }
      });

      $("#resetFeatured").on("click", function(){
        // reset featured area
        $("#galleryHero")
          .attr("aria-label", "Featured artwork")
          .html('<div class="gallery-hero-inner"><p class="text-muted-weak mb-0">Click a tile below to feature it here.</p></div>');
        $(".gallery-tile").removeClass("is-selected");
      });
    }

    
    if ($("#toggleHighlightFacts").length){
      $("#toggleHighlightFacts").on("click", function(){
        $("#spotlightFacts").toggleClass("is-highlight"); // demo: toggleClass
      });
    }

    
    if ($("#spotlightGrid").length){
      var APPLAUSE_KEY = "rampage_spotlight_applause_v1";
      var NOM_KEY = "rampage_spotlight_nominations_v1";
      var PIN_KEY = "rampage_spotlight_pinned_v1";

      var STUDENTS = [
        { id:"featured", name:"Alex Rivera", program:"BSIT", year:"2nd Year", tagline:"Community Builder", category:"leadership", featured:true,
          story:"Recognized for organizing peer tutoring sessions, leading a campus clean-up drive, and building a welcoming space for first-year students.",
          achievements:["Dean’s Lister","Org Officer","Volunteer"],
          badges:["Peer Mentor","Event Lead"],
          quote:"Be the person you needed when you were starting.",
          highlights:["Created a weekly tutoring schedule","Led 80+ volunteers in campus clean-up","Mentored first-year students"],
          image:"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
        },
        { id:"mika", name:"Mika Santos", program:"BSCS", year:"3rd Year", tagline:"Hackathon Winner", category:"academic",
          story:"Built a study-planner web app for students and helped classmates learn JavaScript through peer sessions.",
          achievements:["Research Presenter","Top 10 Hackathon","Peer Tutor"],
          badges:["Coder","Research"],
          quote:"Small progress daily becomes big results.",
          highlights:["Won Top 10 at inter-school hackathon","Presented at student research forum","Hosted weekly JS study groups"],
          image:"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
        },
        { id:"jules", name:"Jules Mercado", program:"BSEd", year:"4th Year", tagline:"Campus Volunteer", category:"service",
          story:"Consistently leads outreach programs and encourages students to participate in community service.",
          achievements:["Volunteer Leader","Outreach Organizer","Peer Support"],
          badges:["Service","Leadership"],
          quote:"The best spotlight is the one you share.",
          highlights:["Organized donation drive","Led weekend tutoring for kids","Coordinated relief operations"],
          image:"https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80"
        },
        { id:"bea", name:"Bea Lim", program:"BFA", year:"2nd Year", tagline:"Creative Storyteller", category:"arts",
          story:"Turns student life into visual stories — posters, photos, and designs that make campus events shine.",
          achievements:["Poster Designer","Photo Feature","Art Exhibit"],
          badges:["Design","Media"],
          quote:"Make it clear. Make it kind. Make it memorable.",
          highlights:["Designed event posters","Curated mini exhibit","Documented campus events"],
          image:"https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80"
        },
        { id:"kai", name:"Kai Dela Cruz", program:"BSBA", year:"1st Year", tagline:"Varsity Rookie", category:"sports",
          story:"Shows outstanding discipline in training and motivates peers with sportsmanship and teamwork.",
          achievements:["Team Player","Discipline Award","Rookie MVP"],
          badges:["Athlete","Teamwork"],
          quote:"Consistency beats intensity when it matters.",
          highlights:["Rookie MVP","Led team drills","Promoted healthy campus activities"],
          image:"https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80"
        }
      ];

      function safeJsonGet(key){
        try {
          var raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : {};
        } catch(e){ return {}; }
      }
      function safeJsonSet(key, value){
        try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
      }

      function getApplauseMap(){ return safeJsonGet(APPLAUSE_KEY); }
      function setApplauseMap(m){ safeJsonSet(APPLAUSE_KEY, m); }

      function getNoms(){
        try {
          var raw = localStorage.getItem(NOM_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch(e){ return []; }
      }
      function setNoms(list){
        try { localStorage.setItem(NOM_KEY, JSON.stringify(list)); } catch(e) {}
      }

      function categoryLabel(c){
        return (c === "academic") ? "Academic" : (c === "leadership") ? "Leadership" : (c === "sports") ? "Sports" : (c === "arts") ? "Arts" : "Service";
      }

      function initials(name){
        var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return "S";
        var a = parts[0][0] || "S";
        var b = parts.length > 1 ? (parts[parts.length-1][0] || "") : "";
        return (a + b).toUpperCase();
      }

      function getPinnedId(){
        try { return localStorage.getItem(PIN_KEY) || ""; } catch(e){ return ""; }
      }
      function setPinnedId(id){
        try {
          if (id) localStorage.setItem(PIN_KEY, String(id));
          else localStorage.removeItem(PIN_KEY);
        } catch(e) {}
      }

      function studentCardHtml(s, applause, pinnedId){
        var count = applause[s.id] || 0;
        var ribbon = "";
        if (String(pinnedId) === String(s.id)) ribbon = '<span class="top-ribbon">Pinned</span>';
        else if (s.featured) ribbon = '<span class="top-ribbon">Featured</span>';
        return (
          '<div class="col-md-6 col-lg-4 spot-card" data-category="'+escapeHtml(s.category)+'" data-id="'+escapeHtml(s.id)+'">' +
            '<article class="student-card p-3" aria-label="Student profile card">' +
              ribbon +
              '<div class="d-flex gap-3 align-items-start">' +
                '<div class="student-avatar" aria-hidden="true">'+escapeHtml(initials(s.name))+'</div>' +
                '<div class="flex-grow-1">' +
                  '<div class="d-flex justify-content-between gap-2">' +
                    '<h3 class="h5 mb-1">'+escapeHtml(s.name)+'</h3>' +
                    '<span class="badge-pill badge-study" style="background:rgba(244,208,63,0.22);border-color:rgba(244,208,63,0.45);">'+escapeHtml(categoryLabel(s.category))+'</span>' +
                  '</div>' +
                  '<div class="text-muted-weak">'+escapeHtml(s.program)+' • '+escapeHtml(s.year)+' • '+escapeHtml(s.tagline)+'</div>' +
                  '<p class="mt-2 mb-2">'+escapeHtml(s.story)+'</p>' +
                  '<div class="d-flex gap-2 flex-wrap align-items-center justify-content-between">' +
                    '<button class="btn-gold-outline js-open-student" type="button" data-id="'+escapeHtml(s.id)+'" data-bs-toggle="modal" data-bs-target="#spotlightModal" aria-label="Open '+escapeHtml(s.name)+' profile">' +
                      '<i class="fa-solid fa-id-card" aria-hidden="true"></i> Open Profile' +
                    '</button>' +
                    '<button class="like-btn js-applaud" type="button" data-id="'+escapeHtml(s.id)+'" aria-label="Applaud '+escapeHtml(s.name)+'">' +
                      '<i class="fa-solid fa-hands-clapping" aria-hidden="true"></i> ' +
                      '<span class="js-applause">'+escapeHtml(count)+'</span>' +
                    '</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</article>' +
          '</div>'
        );
      }

      function computeTotals(){
        var applause = getApplauseMap();
        var totalApplause = 0;
        Object.keys(applause).forEach(function(k){ totalApplause += Number(applause[k] || 0); });

        $("#spotlightTotal").text(String(STUDENTS.length));
        $("#nominationsTotal").text(String(getNoms().length));
        $("#applauseTotal").text(String(totalApplause));

        $("#featuredApplause").text(String(applause.featured || 0));
      }

      function applySpotFilters(){
        var cat = $(".js-spot-filter.active").data("category") || "all";
        var q = ($("#spotlightSearch").val() || "").trim().toLowerCase();

        $(".spot-card").each(function(){
          var $c = $(this);
          var c = $c.data("category");
          var text = $c.text().toLowerCase();
          var okCat = (cat === "all") || (String(c) === String(cat));
          var okQ = (!q) || (text.indexOf(q) !== -1);
          if (okCat && okQ){ $c.show(); } else { $c.hide(); }
        });

        var visibleCount = $(".spot-card:visible").length;
        $("#spotlightCount").val(visibleCount + (visibleCount === 1 ? " profile" : " profiles"));
      }

      function renderSpotlight(){
        var applause = getApplauseMap();
        var sortMode = $("#spotlightSort").val() || "featured";
        var pinnedId = getPinnedId();

        var list = STUDENTS.slice();
        if (sortMode === "name"){
          list.sort(function(a,b){ return String(a.name).localeCompare(String(b.name)); });
        } else if (sortMode === "applause"){
          list.sort(function(a,b){
            var aa = Number(applause[a.id] || 0);
            var bb = Number(applause[b.id] || 0);
            return bb - aa;
          });
        } else {
          list.sort(function(a,b){
            var pa = (String(a.id) === String(pinnedId)) ? 1 : 0;
            var pb = (String(b.id) === String(pinnedId)) ? 1 : 0;
            if (pa !== pb) return pb - pa;
            return (b.featured?1:0) - (a.featured?1:0);
          });
        }

        $("#spotlightGrid").empty(); 
        for (var i=0; i<list.length; i++){
          $("#spotlightGrid").append(studentCardHtml(list[i], applause, pinnedId));
        }

        applySpotFilters();
        computeTotals();
      }

      $(".js-spot-filter").on("click", function(){
        $(".js-spot-filter").removeClass("active");
        $(this).addClass("active");
        applySpotFilters();
      });
      $("#spotlightSearch").on("input", applySpotFilters);
      $("#spotlightSort").on("change", renderSpotlight);

      $(document).on("click", ".js-applaud", function(){
        var id = String($(this).data("id") || "");
        if (!id) return;
        var applause = getApplauseMap();
        applause[id] = Number(applause[id] || 0) + 1;
        setApplauseMap(applause);

        $(".js-applaud[data-id=\""+id+"\"]").each(function(){
          var $btn = $(this);
          $btn.addClass("is-liked");
          $btn.find(".js-applause").text(String(applause[id] || 0));
        });
        if (id === "featured"){
          $("#featuredApplause").text(String(applause[id] || 0));
        }
        var $modalBtn = $("#spotlightModal .js-applaud");
        if ($modalBtn.length && String($modalBtn.attr("data-id")) === String(id)){
          $("#modalApplause").text(String(applause[id] || 0));
        }

        var $spark = $('<span class="sparkle" aria-hidden="true">✨</span>');
        $(this).closest("article, #featuredStudent, .modal-content").append($spark);
        setTimeout(function(){ $spark.remove(); }, 750);

        computeTotals();
      });

      function openStudentModal(id){
        var applause = getApplauseMap();
        var s = null;
        for (var i=0; i<STUDENTS.length; i++){
          if (String(STUDENTS[i].id) === String(id)){ s = STUDENTS[i]; break; }
        }
        if (!s) return;

        $("#spotlightModalLabel").text(s.name);
        $("#modalMeta").text(s.program + " • " + s.year + " • " + s.tagline + " • " + categoryLabel(s.category));
        $("#modalStory").text(s.story);
        $("#modalQuote").text('“' + s.quote + '”');

        $("#spotlightModal .js-applaud").attr("data-id", s.id);
        $("#modalApplause").text(String(applause[s.id] || 0));

        var pinnedId = getPinnedId();
        $("#pinStudent").attr("data-id", s.id).text(String(pinnedId) === String(s.id) ? "Unpin" : "Pin");

        $("#modalPhoto").html(
          '<img src="'+escapeHtml(s.image)+'" alt="'+escapeHtml(s.name)+'" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">'
        );

        var badges = "";
        for (var b=0; b<s.achievements.length; b++){
          badges += '<span class="achv-badge"><i class="fa-solid fa-award" aria-hidden="true"></i> ' + escapeHtml(s.achievements[b]) + '</span>';
        }
        $("#modalBadges").html(badges);

        var lis = "";
        for (var j=0; j<s.highlights.length; j++){
          lis += '<li>' + escapeHtml(s.highlights[j]) + '</li>';
        }
        $("#modalHighlights").html(lis);
      }

      $(document).on("click", ".js-open-student", function(){
        openStudentModal($(this).data("id"));
      });

      $("#pinStudent").on("click", function(){
        var id = String($(this).attr("data-id") || "");
        if (!id) return;
        var current = getPinnedId();
        setPinnedId(String(current) === String(id) ? "" : id);
        renderSpotlight();

        $(this).text(getPinnedId() ? "Unpin" : "Pin");
      });

      function updateNomPreview(){
        var name = $("#nomStudent").val().trim();
        var prog = $("#nomProgram").val().trim();
        var cat = $("#nomCategory").val();
        var reason = $("#nomReason").val();
        $("#nomChars").text(String(reason.length));
        $("#nomPreviewName").text(name || "Student Name");
        $("#nomPreviewProg").text(prog || "Program • Year");
        $("#nomPreviewCat").text(categoryLabel(cat || "leadership"));
        $("#nomPreviewReason").text(reason || "Your nomination preview will appear here…");
      }
      $("#nomStudent, #nomProgram, #nomCategory, #nomReason").on("input", updateNomPreview);
      updateNomPreview();

      $("#fillNomDemo").on("click", function(){
        $("#nomStudent").val("Pat Cruz");
        $("#nomProgram").val("BSIT • 1st Year");
        $("#nomBy").val("A classmate");
        $("#nomCategory").val("academic");
        $("#nomReason").val("Pat consistently helps classmates understand difficult topics, shares notes, and motivates everyone to keep improving. Their kindness and dedication deserve recognition.");
        updateNomPreview();
      });

      $("#nominateForm").on("submit", function(e){
        e.preventDefault();
        e.stopPropagation();
        var form = this;
        if (form.checkValidity && !form.checkValidity()){
          $(form).addClass("was-validated");
          return;
        }
        $(form).addClass("was-validated");

        var nom = {
          id: String(Date.now()),
          name: $("#nomStudent").val().trim(),
          program: $("#nomProgram").val().trim(),
          category: $("#nomCategory").val(),
          nominatedBy: $("#nomBy").val().trim(),
          reason: $("#nomReason").val().trim(),
          createdAt: (new Date()).toISOString()
        };
        var list = getNoms();
        list.push(nom);
        setNoms(list);

        $("#nomStudent").val("");
        $("#nomProgram").val("");
        $("#nomBy").val("");
        $("#nomCategory").val("leadership");
        $("#nomReason").val("");
        $(form).removeClass("was-validated");
        updateNomPreview();

        var modalEl = document.getElementById("nominateModal");
        if (modalEl && typeof bootstrap !== "undefined"){
          try { bootstrap.Modal.getOrCreateInstance(modalEl).hide(); } catch(e) {}
        }
        var toastEl = document.getElementById("spotlightToast");
        if (toastEl && typeof bootstrap !== "undefined"){
          try { new bootstrap.Toast(toastEl).show(); } catch(e) {}
        }

        computeTotals();
      });

      function setFeatured(s){
        $("#featuredName").text(s.name);
        $("#featuredMeta").text(s.program + " • " + s.year + " • " + s.tagline);
        $("#featuredStory").text(s.story);
        $("#featuredCategory").text(categoryLabel(s.category));
      }

      $("#surprisePick").on("click", function(){
        var idx = Math.floor(Math.random() * STUDENTS.length);
        var s = STUDENTS[idx];
        if (!s) return;
        setFeatured(s);

        var $fs = $("#featuredStudent");
        $fs.css("box-shadow", "0 0 0 5px rgba(244,208,63,0.35)");
        setTimeout(function(){ $fs.css("box-shadow", ""); }, 420);
      });

      $("#shareSpotlight").on("click", function(){
        var text = "RAMpage Spotlight: " + $("#featuredName").text() + " — " + $("#featuredStory").text();
        var $hint = $("#shareHint");
        if (navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(text).then(function(){
            $hint.text("Copied a share text! Paste it anywhere.");
            setTimeout(function(){ $hint.text(""); }, 2000);
          }).catch(function(){
            $hint.text("Copy failed — you can manually copy from the featured text.");
            setTimeout(function(){ $hint.text(""); }, 2200);
          });
        } else {
          $hint.text("Clipboard not available — select and copy the featured text.");
          setTimeout(function(){ $hint.text(""); }, 2200);
        }
      });

      renderSpotlight();
      computeTotals();
    }

    
    if ($("#contactForm").length){
      var $name = $("#fullName");
      var $email = $("#emailAddress");
      var $msg = $("#messageBody");

      function updatePreview(){
        var nameVal = $name.val().trim();
        var emailVal = $email.val().trim();
        var msgVal = $msg.val();

        $("#previewName").text(nameVal || "Your name");
        $("#previewEmail").text(emailVal || "you@domain.com");
        $("#previewMessage").text(msgVal || "Your message preview will appear here...");
        $("#messageCount").text(String(msgVal.length)); 
      }

      $name.on("input", updatePreview);
      $email.on("input", updatePreview);
      $msg.on("input", updatePreview);
      updatePreview();

      $("#fillDemo").on("click", function(){
        $name.val("Jane Doe");
        $email.val("jane@domain.com");
        $msg.val("Hello RAMpage team! This is a demo message added with jQuery .val().");
        updatePreview();
      });

      $("#contactForm").on("submit", function(e){
        e.preventDefault();
        e.stopPropagation();

        var form = this;
        if (form.checkValidity && !form.checkValidity()){
          $(form).addClass("was-validated");
          return;
        }
        $(form).addClass("was-validated");

        var toastEl = document.getElementById("contactToast");
        if (toastEl && typeof bootstrap !== "undefined"){
          try { new bootstrap.Toast(toastEl).show(); } catch(e) {}
        }

        $name.val("");
        $email.val("");
        $msg.val("");
        updatePreview();

        $(form).removeClass("was-validated");
      });
    }

  });

})(jQuery);
