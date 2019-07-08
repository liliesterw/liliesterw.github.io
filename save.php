<?php
   $str = '{"yes":'.$_POST['text1'].',"total":'.$_POST['text2']."}";
   echo $str;
   $fp = fopen('d3/response1.json', 'w+');
	fwrite($fp, $str);
	fclose($fp);
?>