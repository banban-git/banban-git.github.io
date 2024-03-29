var count = 20000; //カウントダウンの数字を格納する変数
var min = 0; //残り時間「分」を格納する変数
var sec = 0; //残り時間「秒」を格納する変数
var stp = null; //setInerval・clearInervalを制御する変数
var quizCount = 0; //クイズ出題数
var tokutenCount = 0; //クイズの得点
var quizeTotalMaxCount = 20; //クイズ全出題数
var seikaisuu = 0; //正解数

$(function () {
  // 音声ファイルを読み込み
  var audio = $("#qmaAudio")[0];
  var seikaiAudio = $("#seikaiAudio")[0];
  var huseikaiAudio = $("#huseikaiAudio")[0];

  /////////////////////////
  // ゲームスタートクリック時
  /////////////////////////
  $('#btnsend').on('click', function () {
    // 音声の再生
    audio.load();
    audio.play();
    audio.loop = true;
    audio.volume = 0.8
    // 表示エリア切り替え
    document.getElementById("startArea").style.display = "none";
    document.getElementById("questionArea").style.display = "";
    
    // 問題データ取得
    getQuestion();
  });

  /////////////////////////
  // 問題取得 (GASから取得)
  /////////////////////////
  function getQuestion() {
    var quizDataTarget = document.getElementById("quizDataTarget").value;
    // Ajax通信を開始
    $.ajax({
      url: 'https://script.google.com/macros/s/AKfycbzgifIdZ2n5YWdEr18zmJLLN1QPlZfV7KuiILefiV1V8S2gRDQlzg2pDkhMrBUdy3ix/exec?target=' + quizDataTarget,
      type: 'GET',
      async: false,
      dataType: 'json'
    }).done(function (data) {
      // クイズデータ反映
      var quizData = data.quiz.replace(/(\S)/g, '<span>$1</span>');
      document.getElementById('result').innerHTML = quizData + "<BR><BR><BR><BR><BR><BR>"
      document.getElementById('sentaku1').value = data.sentaku1
      document.getElementById('sentaku1').innerHTML = "<span class=' has-text-weight-bold'>" + data.sentaku1 + "</span>"
      document.getElementById('sentaku2').value = data.sentaku2
      document.getElementById('sentaku2').innerHTML = "<span class=' has-text-weight-bold'>" + data.sentaku2 + "</span>"
      document.getElementById('sentaku3').value = data.sentaku3
      document.getElementById('sentaku3').innerHTML = "<span class=' has-text-weight-bold'>" + data.sentaku3 + "</span>"
      document.getElementById('sentaku4').value = data.sentaku4
      document.getElementById('sentaku4').innerHTML = "<span class=' has-text-weight-bold'>" + data.sentaku4 + "</span>"
      document.getElementById('answer').value = data.answer
      
      // クイズ問題フェードイン（１文字ずつ）
      $('.typ').css({
        'opacity': 1
      });
      var typLength = $('.typ').children().length;
      for (var i = 0; i <= typLength; i++) {
        $('.typ').children('span:eq(' + i + ')').delay(50 * i).animate({
          'opacity': 1 }, 50);
      };

      // カウントダウンスタート 
      count_start();
      buttonDiableSwitch(false)

      // クイズ数カウント
      quizCount = quizCount + 1
      document.getElementById('quizCountArea').innerHTML =  quizCount + "問目 /全" + quizeTotalMaxCount + "問";

    }).fail(function () {
      // 通信失敗時の処理を記述
      alert("通信エラー")
    });
  }

  /////////////////////////
  // 正解処理
  /////////////////////////
  function seikai() {
    seikaiAudio.play();
    document.getElementById('result').innerHTML = "<BR><BR><BR><span style='opacity: 1;' class='is-size-2 has-text-danger'>正解"

    // 正解数カウントアップ
    seikaisuu += 1;

    // 得点計算
    var haibun = count / 17500;
    if (haibun > 1) {
      haibun = 1.00;
    }
    var eachMaxTokuten = (100 / quizeTotalMaxCount) * haibun
    tokutenCount += Number(eachMaxTokuten.toFixed(2));
    if (String(tokutenCount).length > 5){
      tokutenCount = Number(String(tokutenCount).slice(0, 5));
    }
    document.getElementById('quizTokutenArea').innerHTML = "得点:" + tokutenCount;
  }

  /////////////////////////
  // 不正解処理
  /////////////////////////
  function huseikai() {
    var sentakuArea = null;
    var answer = document.getElementById("answer").value;
    if ($('#sentaku1').val() == answer) {
      sentakuArea = "A:";
    } else if ($('#sentaku2').val() == answer) {
      sentakuArea = "B:";
    } else if ($('#sentaku3').val() == answer) {
      sentakuArea = "C:";
    } else if ($('#sentaku4').val() == answer) {
      sentakuArea = "D:";
    }
    huseikaiAudio.play();
    document.getElementById('result').innerHTML = "<BR><BR><span style='opacity: 1;' class='is-size-2 has-text-link'>不正解</span> <br><span style='opacity: 1;' class='has-text-link'>（正解は、" + sentakuArea + answer + ")</span>"
  }

  /////////////////////////////////////////////////////////
  // カウントスタート（1000ミリ秒毎にcont_down関数を呼び出す）
  /////////////////////////////////////////////////////////
  function count_start() {
    count = 20000
    stp = setInterval(count_down, 10);
  }
  /////////////////////////////////////////////////////////
  // カウントダウン処理
  /////////////////////////////////////////////////////////
  function count_down() {
    if (count == 0) {
      var display = document.getElementById("countDownArea");
      display.innerHTML = "TIME UP!!";
      
      // 選択肢を比活性
      buttonDiableSwitch(true)
      huseikai()
      setTimeout(nextQuestion, 2000);
      clearInterval(stp);
    } else {
      count = count - 10;
      sec = count / 1000;
      var count_down = document.getElementById("countDownArea");
      count_down.innerHTML = "残り時間" + sec.toFixed(2) + "秒"
    }
  }

  function nextQuestion() {
    if (quizeTotalMaxCount == quizCount) {
       // ゲーム終了
       document.getElementById('result').innerHTML = "<BR><BR><span style='opacity: 1;' class='is-size-2 has-text-danger'>ゲーム終了</span><BR><span style='opacity: 1;''>正解数 " + seikaisuu + ", 正解率: " +  (seikaisuu * 100/quizeTotalMaxCount) + "% </span>"
       return;
    }
    
    // 問題集取得
    getQuestion();        
  }
  
  // A選択時
  $('#sentaku1').on('click', function () {
    getAnswer(this);
  });
  // B選択時
  $('#sentaku2').on('click', function () {
    getAnswer(this);
  });
  // C選択時
  $('#sentaku3').on('click', function () {
    getAnswer(this);
  });
  // D選択時
  $('#sentaku4').on('click', function () {
    getAnswer(this);
  });

  function buttonDiableSwitch(switchFlg) {
    document.getElementById("sentaku1").disabled = switchFlg;
    document.getElementById("sentaku2").disabled = switchFlg;
    document.getElementById("sentaku3").disabled = switchFlg;
    document.getElementById("sentaku4").disabled = switchFlg;
  }
  /////////////
  // 回答取得
  ///////////// 
  function getAnswer(sentakuId) {
    buttonDiableSwitch(true)
    
    $('.typ').css({'opacity': 1 });
    
    // 回答判定
    var answer = document.getElementById("answer").value;
    var sentaku = $(sentakuId).val();
    if (sentaku == answer) {
      seikai();
    } else {
      huseikai();
    }
    // 次の問題へ
    setTimeout(nextQuestion, 2000);
    // カウントダウンSTOP
    clearInterval(stp);
  }
}); 