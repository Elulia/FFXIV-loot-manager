<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title></title>
</head>
<body>

</body>
</html>
<?php

/* id, icon, name, level_item, special_shops_obtain[0].items.cost_item_1.name, special_shops_obtain[0].items.cost_count_1
for level_item > 290


itemName selected
location selected */

$t=file_get_contents("data_to_parse.html");
$tab0 =['<td','itemName selected','</td>'];
$tab =['<td','location selected','</td>'];

function findall($str,$tab){
	$save = [];
	$i = 0;
	$save_tempo = "";
	$index = 0;
	while ($index < strlen($str))
	{
		$etat_courant = $str[$index];
		if ($etat_courant == $tab[$i][0])
		{
			if (test_array($i,$str,$index,$tab[$i]))
			{
				$index+=(strlen($tab[$i])-1);
				$save_tempo.=$tab[$i];
				$i++;
				if ($i == sizeof($tab))
				{
					$save [] = $save_tempo;
					$i = 0;
					$save_tempo = '';
				}
			}
			elseif ($i != 0){
				$save_tempo = $save_tempo.$etat_courant;
			}
			
		}
		elseif ($i == 1 and $etat_courant == '>')
		{
			$i = 0;
			$save_tempo = "";
		}
		elseif ($i != (sizeof($tab)-1) and test_array((sizeof($tab)-1),$str,$index,$tab[(sizeof($tab)-1)])) 
		{
			$i = 0;
			$save_tempo = "";
		}
		elseif ($i != 0) 
		{
			$save_tempo .= $etat_courant;
		}
		$index++;
	}
	return $save;
}

function test_array($i,$str,$index,$tab){
	$k = 0;
	for ($j = 0; $j < strlen($tab) && ($index+$j<strlen($str)); $j++)
	{
		if ($str[$index+$j] == $tab[$j])
		{
			$k++;
		}
	}
	if ($k==strlen($tab)){
		return true;
	}
	return false;
 }

$save0 = findall($t,$tab0);
$save2 = findall($t,$tab);
$save = array_merge($save0,$save2);

echo'<table>';
foreach ($save as $key => $value) {
	echo'<tr><td>',$value,'</td></tr>';
}
echo'</table>';
?>

