---
layout:     post
title:      "Title"
date:       2021-10-20 6:00:00 +0100
published:  true
didyouknow: false
lang:       pl
author:     mhoja
image:      /assets/img/posts/2021-10-20-porownanie-jezykow-cloud-functions/clouds.jpg
tags:
    - cloud
    - functions
    - cloud function
    - cold start
    - gcp
    - googlecloud
    - google
    - serverless

description: "W jakim języku programowania pisać funkcje w Google Cloud? Które środowisko uruchomieniowe jest najszybsze, czy ma na to wpływ region? Czy języki skryptowe mają mniejszy cold start?"
---

Jeżeli chociaż raz zastanawiałeś się, w jakim języku programowania napisać funkcję w Google Cloud, to w tym wpisie postaram się pomóc w podjęciu tej decyzji.

Na warsztat weźmiemy wszystkie dostępne na ten moment środowiska uruchomieniowe dla Google Cloud Functions i porównamy czasy odpowiedzi oraz zimne starty (tzw. cold starts).
Porównamy nie tylko środowiska uruchomieniowe, ale również regiony w których osadzone są funkcje.

# Motywacja

Pisząc swoją pierwszą funkcję w GCP zastanawiałem się, w jakim języku ją napisać? Przecież to prosta funkcja, mogę ją napisać w każdym dostępnym języku. Pisać w Javie, której używam na codzień? A może w Node.js? Przecież TypeScript też jest dla mnie codziennością...

Motywacją do przeprowadzenia testów był przede wszystkim brak odpowiedzi na moje pytania oraz brak porównań środowisk uruchomieniowych dla Cloud Functions w Internecie.

# Środowisko testowe

Google co chwilę rozszerza listę obsługiwanych środowisk uruchomieniowych, dlatego zależało mi na tym, żeby porównanie funkcji było łatwe do przeprowadzenia w przyszłości, z uwzględnieniem nowych języków. Chcąc zautomatyzować całą procedurę i środowisko testowe, wraz z kolegą Jackiem Grobelnym przygotowaliśmy projekt pt. **Google Coud Functions Comparison**.

Do automatyzacji wykorzystany został Terraform, za pomocą którego przygotowywane jest całe środowisko testowe. Wszystkie deployowane funkcje są definiowane w konfiguracji, dlatego w prosty sposób można uruchomić środowisko testujące wybrane języki oraz regiony.

Testy czasów odpowiedzi zostały napisane w Gatlingu, który listę funkcji odczytuje z tej samej konfiguracji, przez co nie wymaga żadnej dodatkowej ingerencji. Testy zimnych startów wykonywane są natomiast bezpośrednio przez kod napisany w Scali, a wyniki wyświetlane są w formie tabeli ASCII.

Kody wszystkich funkcji znajdują się w folderze `/functions` i są to podstawowe funkcje odpowiadające *"Hello World"*, takie same jak przykładowe funkcje tworzone z poziomu Cloud Console.

Projekt znajduję się na GitHubie - [link do repozytorium.](https://github.com/Michuu93/google-cloud-function-comparison)

## Metodyka testowania

W testach wykorzystałem funkcje uruchomione w następujących środowiskach uruchomieniowych:

- .NET Core 3.1
- Go 1.13
- Java 11
- Node.js 14
- PHP 7.4
- Python 3.9
- Ruby 2.7

Każda funkcja posiadała maksymalnie jedną instancję, przydzieloną pamięć 128 MB i została uruchomiona w regionach:

- `europe-west3` (Frankfurt, Germany, Europe)
- `us-central1` (Council Bluffs, Iowa, North America)
- `asia-east2` (Hong Kong, APAC)

W celu porównania czasów odpowiedzi, każda funkcja była wywoływana przez 10 minut i 20 równoległych użytkowników. Ilość wykonanych żądań jest zatem uzależniona od samej funkcji oraz Gatlinga.

Testy zimnych startów zostały wykonane z zapewnieniem braku istnienia aktywnej instancji. Test polegał na wykonaniu 10 żądań do każdej z funkcji, a następnie porównaniu czasu pierwszej odpowiedzi do średniej arytmetycznej czasów pozostałych 9 odpowiedzi.

# Czasy odpowiedzi

<link href="https://cdn.jsdelivr.net/npm/simple-datatables@latest/dist/style.css" rel="stylesheet" type="text/css">
<style>
    .dataTable-pagination {
        display: none;
    }
</style>
<script src="https://cdn.jsdelivr.net/npm/simple-datatables@latest" type="text/javascript"></script>
<table id="responseTimes">
    <thead>
        <tr>
            <th>Runtime</th>
            <th>Region</th>
            <th>Requests</th>
            <th>Min</th>
            <th>95th pct</th>
            <th>Max</th>
            <th>Mean</th>
            <th>Std Dev</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>nodejs14</td>
            <td>europe-west3</td>
            <td>20796</td>
            <td>85</td>
            <td>909</td>
            <td>1591</td>
            <td>576</td>
            <td>182</td>
        </tr>
        <tr>
            <td>go113</td>
            <td>europe-west3</td>
            <td>25681</td>
            <td>83</td>
            <td>856</td>
            <td>7607</td>
            <td>466</td>
            <td>213</td>
        </tr>
        <tr>
            <td>java11</td>
            <td>europe-west3</td>
            <td>20408</td>
            <td>83</td>
            <td>1078</td>
            <td>2675</td>
            <td>587</td>
            <td>259</td>
        </tr>
        <tr>
            <td>python39</td>
            <td>europe-west3</td>
            <td>20810</td>
            <td>83</td>
            <td>893</td>
            <td>1601</td>
            <td>575</td>
            <td>160</td>
        </tr>
        <tr>
            <td>ruby27</td>
            <td>europe-west3</td>
            <td>25818</td>
            <td>82</td>
            <td>711</td>
            <td>1791</td>
            <td>464</td>
            <td>156</td>
        </tr>
        <tr>
            <td>dotnet3</td>
            <td>europe-west3</td>
            <td>17489</td>
            <td>84</td>
            <td>1003</td>
            <td>3912</td>
            <td>685</td>
            <td>218</td>
        </tr>
        <tr>
            <td>php74</td>
            <td>europe-west3</td>
            <td>25162</td>
            <td>84</td>
            <td>793</td>
            <td>1494</td>
            <td>476</td>
            <td>160</td>
        </tr>
        <tr>
            <td>nodejs14</td>
            <td>us-central1</td>
            <td>16341</td>
            <td>192</td>
            <td>1100</td>
            <td>2789</td>
            <td>733</td>
            <td>244</td>
        </tr>
        <tr>
            <td>go113</td>
            <td>us-central1</td>
            <td>19738</td>
            <td>192</td>
            <td>1017</td>
            <td>1757</td>
            <td>607</td>
            <td>213</td>
        </tr>
        <tr>
            <td>java11</td>
            <td>us-central1</td>
            <td>16545</td>
            <td>190</td>
            <td>1400</td>
            <td>7796</td>
            <td>724</td>
            <td>339</td>
        </tr>
        <tr>
            <td>python39</td>
            <td>us-central1</td>
            <td>14907</td>
            <td>192</td>
            <td>1200</td>
            <td>2302</td>
            <td>804</td>
            <td>248</td>
        </tr>
        <tr>
            <td>ruby27</td>
            <td>us-central1</td>
            <td>17968</td>
            <td>193</td>
            <td>1091</td>
            <td>3559</td>
            <td>667</td>
            <td>229</td>
        </tr>
        <tr>
            <td>dotnet3</td>
            <td>us-central1</td>
            <td>14444</td>
            <td>192</td>
            <td>1197</td>
            <td>3407</td>
            <td>830</td>
            <td>240</td>
        </tr>
        <tr>
            <td>php74</td>
            <td>us-central1</td>
            <td>16172</td>
            <td>193</td>
            <td>1104</td>
            <td>2088</td>
            <td>741</td>
            <td>192</td>
        </tr>
        <tr>
            <td>nodejs14</td>
            <td>asia-east2</td>
            <td>25112</td>
            <td>352</td>
            <td>780</td>
            <td>2086</td>
            <td>477</td>
            <td>142</td>
        </tr>
        <tr>
            <td>go113</td>
            <td>asia-east2</td>
            <td>28831</td>
            <td>350</td>
            <td>587</td>
            <td>1604</td>
            <td>415</td>
            <td>112</td>
        </tr>
        <tr>
            <td>java11</td>
            <td>asia-east2</td>
            <td>22617</td>
            <td>352</td>
            <td>1093</td>
            <td>5098</td>
            <td>530</td>
            <td>292</td>
        </tr>
        <tr>
            <td>python39</td>
            <td>asia-east2</td>
            <td>20441</td>
            <td>373</td>
            <td>889</td>
            <td>1786</td>
            <td>586</td>
            <td>146</td>
        </tr>
        <tr>
            <td>ruby27</td>
            <td>asia-east2</td>
            <td>28630</td>
            <td>349</td>
            <td>589</td>
            <td>1872</td>
            <td>418</td>
            <td>106</td>
        </tr>
        <tr>
            <td>dotnet3</td>
            <td>asia-east2</td>
            <td>21549</td>
            <td>364</td>
            <td>896</td>
            <td>3197</td>
            <td>556</td>
            <td>184</td>
        </tr>
        <tr>
            <td>php74</td>
            <td>asia-east2</td>
            <td>26001</td>
            <td>351</td>
            <td>715</td>
            <td>1786</td>
            <td>461</td>
            <td>140</td>
        </tr>
    </tbody>
</table>

<script type="text/javascript">
    new simpleDatatables.DataTable("#responseTimes", {
        searchable: false,
        paging: false,
        info: false
    });
</script>

# Zimne starty

<style>
/* Style the tab */
.tab {
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}

/* Style the buttons inside the tab */
.tab button {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
  font-size: 17px;
}

/* Change background color of buttons on hover */
.tab button:hover {
  background-color: #ddd;
}

/* Create an active/current tablink class */
.tab button.active {
  background-color: #ccc;
}

/* Style the tab content */
.tabcontent {
  display: none;
  animation: fadeEffect 1s; /* Fading effect takes 1 second */
}

/* Go from zero to full opacity */
@keyframes fadeEffect {
  from {opacity: 0;}
  to {opacity: 1;}
}
</style>

<div class="tab">
    <button class="tablinks" onclick="showTable(event, 'coldstarts1')" id="defaultOpen">Run #1</button>
    <button class="tablinks" onclick="showTable(event, 'coldstarts2')">Run #2</button>
    <button class="tablinks" onclick="showTable(event, 'coldstarts3')">Run #3</button>
    <button class="tablinks" onclick="showTable(event, 'coldstarts4')">Run #4</button>
    <button class="tablinks" onclick="showTable(event, 'coldstarts5')">Run #5</button>
</div>

<div id="coldstarts1" class="tabcontent">
    <table id="coldstarts1_table">
        <thead>
            <tr>
                <th>Runtime</th>
                <th>Region</th>
                <th>1st time [ms]</th>
                <th>avg remaining [ms]</th>
                <th>diff [ms]</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>nodejs14</td>
                <td>europe-west3</td>
                <td>795</td>
                <td>60</td>
                <td>735</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>europe-west3</td>
                <td>57</td>
                <td>44</td>
                <td>13</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>europe-west3</td>
                <td>581</td>
                <td>124</td>
                <td>457</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>europe-west3</td>
                <td>64</td>
                <td>48</td>
                <td>16</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>europe-west3</td>
                <td>219</td>
                <td>40</td>
                <td>179</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>europe-west3</td>
                <td>752</td>
                <td>83</td>
                <td>669</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>europe-west3</td>
                <td>376</td>
                <td>47</td>
                <td>329</td>
            </tr>
            <tr>
                <td>nodejs14</td>
                <td>us-central1</td>
                <td>598</td>
                <td>226</td>
                <td>372</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>us-central1</td>
                <td>303</td>
                <td>206</td>
                <td>97</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>us-central1</td>
                <td>717</td>
                <td>215</td>
                <td>502</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>us-central1</td>
                <td>454</td>
                <td>256</td>
                <td>198</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>us-central1</td>
                <td>410</td>
                <td>227</td>
                <td>183</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>us-central1</td>
                <td>923</td>
                <td>291</td>
                <td>632</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>us-central1</td>
                <td>600</td>
                <td>221</td>
                <td>379</td>
            </tr>
            <tr>
                <td>nodejs14</td>
                <td>asia-east2</td>
                <td>615</td>
                <td>389</td>
                <td>226</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>asia-east2</td>
                <td>485</td>
                <td>389</td>
                <td>96</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>asia-east2</td>
                <td>1101</td>
                <td>432</td>
                <td>669</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>asia-east2</td>
                <td>411</td>
                <td>420</td>
                <td>-9</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>asia-east2</td>
                <td>479</td>
                <td>368</td>
                <td>111</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>asia-east2</td>
                <td>915</td>
                <td>451</td>
                <td>464</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>asia-east2</td>
                <td>750</td>
                <td>353</td>
                <td>397</td>
            </tr>
        </tbody>
    </table>
</div>

<div id="coldstarts2" class="tabcontent">
    <table id="coldstarts2_table">
        <thead>
            <tr>
                <th>Runtime</th>
                <th>Region</th>
                <th>1st time [ms]</th>
                <th>avg remaining [ms]</th>
                <th>diff [ms]</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>nodejs14</td>
                <td>europe-west3</td>
                <td>663</td>
                <td>44</td>
                <td>619</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>europe-west3</td>
                <td>62</td>
                <td>44</td>
                <td>18</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>europe-west3</td>
                <td>712</td>
                <td>113</td>
                <td>599</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>europe-west3</td>
                <td>63</td>
                <td>48</td>
                <td>15</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>europe-west3</td>
                <td>318</td>
                <td>49</td>
                <td>269</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>europe-west3</td>
                <td>580</td>
                <td>73</td>
                <td>507</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>europe-west3</td>
                <td>349</td>
                <td>50</td>
                <td>299</td>
            </tr>
            <tr>
                <td>nodejs14</td>
                <td>us-central1</td>
                <td>583</td>
                <td>227</td>
                <td>356</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>us-central1</td>
                <td>178</td>
                <td>218</td>
                <td>-40</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>us-central1</td>
                <td>921</td>
                <td>261</td>
                <td>660</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>us-central1</td>
                <td>306</td>
                <td>272</td>
                <td>34</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>us-central1</td>
                <td>308</td>
                <td>204</td>
                <td>104</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>us-central1</td>
                <td>1022</td>
                <td>246</td>
                <td>776</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>us-central1</td>
                <td>693</td>
                <td>193</td>
                <td>500</td>
            </tr>
            <tr>
                <td>nodejs14</td>
                <td>asia-east2</td>
                <td>541</td>
                <td>355</td>
                <td>186</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>asia-east2</td>
                <td>395</td>
                <td>388</td>
                <td>7</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>asia-east2</td>
                <td>1535</td>
                <td>398</td>
                <td>1137</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>asia-east2</td>
                <td>409</td>
                <td>398</td>
                <td>11</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>asia-east2</td>
                <td>512</td>
                <td>416</td>
                <td>96</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>asia-east2</td>
                <td>944</td>
                <td>434</td>
                <td>510</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>asia-east2</td>
                <td>614</td>
                <td>397</td>
                <td>217</td>
            </tr>
        </tbody>
    </table>
</div>

<div id="coldstarts3" class="tabcontent">
    <table id="coldstarts3_table">
        <thead>
            <tr>
                <th>Runtime</th>
                <th>Region</th>
                <th>1st time [ms]</th>
                <th>avg remaining [ms]</th>
                <th>diff [ms]</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>nodejs14</td>
                <td>europe-west3</td>
                <td>663</td>
                <td>48</td>
                <td>615</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>europe-west3</td>
                <td>57</td>
                <td>45</td>
                <td>12</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>europe-west3</td>
                <td>586</td>
                <td>136</td>
                <td>450</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>europe-west3</td>
                <td>199</td>
                <td>41</td>
                <td>158</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>europe-west3</td>
                <td>72</td>
                <td>42</td>
                <td>30</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>europe-west3</td>
                <td>701</td>
                <td>102</td>
                <td>599</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>europe-west3</td>
                <td>308</td>
                <td>45</td>
                <td>263</td>
            </tr>
            <tr>
                <td>nodejs14</td>
                <td>us-central1</td>
                <td>515</td>
                <td>203</td>
                <td>312</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>us-central1</td>
                <td>341</td>
                <td>179</td>
                <td>162</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>us-central1</td>
                <td>1095</td>
                <td>272</td>
                <td>823</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>us-central1</td>
                <td>286</td>
                <td>223</td>
                <td>63</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>us-central1</td>
                <td>316</td>
                <td>214</td>
                <td>102</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>us-central1</td>
                <td>953</td>
                <td>244</td>
                <td>709</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>us-central1</td>
                <td>600</td>
                <td>211</td>
                <td>389</td>
            </tr>
            <tr>
                <td>nodejs14</td>
                <td>asia-east2</td>
                <td>684</td>
                <td>418</td>
                <td>266</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>asia-east2</td>
                <td>379</td>
                <td>398</td>
                <td>-19</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>asia-east2</td>
                <td>1057</td>
                <td>401</td>
                <td>656</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>asia-east2</td>
                <td>511</td>
                <td>409</td>
                <td>102</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>asia-east2</td>
                <td>511</td>
                <td>366</td>
                <td>145</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>asia-east2</td>
                <td>1106</td>
                <td>443</td>
                <td>663</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>asia-east2</td>
                <td>650</td>
                <td>405</td>
                <td>245</td>
            </tr>
        </tbody>
    </table>
</div>

<div id="coldstarts4" class="tabcontent">
    <table id="coldstarts4_table">
        <thead>
            <tr>
                <th>Runtime</th>
                <th>Region</th>
                <th>1st time [ms]</th>
                <th>avg remaining [ms]</th>
                <th>diff [ms]</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>nodejs14</td>
                <td>europe-west3</td>
                <td>1123</td>
                <td>47</td>
                <td>1076</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>europe-west3</td>
                <td>439</td>
                <td>48</td>
                <td>391</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>europe-west3</td>
                <td>1113</td>
                <td>118</td>
                <td>995</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>europe-west3</td>
                <td>1023</td>
                <td>45</td>
                <td>978</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>europe-west3</td>
                <td>998</td>
                <td>42</td>
                <td>956</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>europe-west3</td>
                <td>999</td>
                <td>110</td>
                <td>889</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>europe-west3</td>
                <td>586</td>
                <td>49</td>
                <td>537</td>
            </tr>
            <tr>
                <td>nodejs14</td>
                <td>us-central1</td>
                <td>1142</td>
                <td>204</td>
                <td>938</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>us-central1</td>
                <td>715</td>
                <td>216</td>
                <td>499</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>us-central1</td>
                <td>1908</td>
                <td>322</td>
                <td>1586</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>us-central1</td>
                <td>1228</td>
                <td>227</td>
                <td>1001</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>us-central1</td>
                <td>1127</td>
                <td>204</td>
                <td>923</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>us-central1</td>
                <td>2048</td>
                <td>386</td>
                <td>1662</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>us-central1</td>
                <td>779</td>
                <td>208</td>
                <td>571</td>
            </tr>
            <tr>
                <td>nodejs14</td>
                <td>asia-east2</td>
                <td>1127</td>
                <td>363</td>
                <td>764</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>asia-east2</td>
                <td>743</td>
                <td>372</td>
                <td>371</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>asia-east2</td>
                <td>1331</td>
                <td>420</td>
                <td>911</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>asia-east2</td>
                <td>1128</td>
                <td>396</td>
                <td>732</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>asia-east2</td>
                <td>1033</td>
                <td>398</td>
                <td>635</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>asia-east2</td>
                <td>1229</td>
                <td>447</td>
                <td>782</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>asia-east2</td>
                <td>1298</td>
                <td>398</td>
                <td>900</td>
            </tr>
        </tbody>
    </table>
</div>

<div id="coldstarts5" class="tabcontent">
    <table id="coldstarts5_table">
        <thead>
            <tr>
                <th>Runtime</th>
                <th>Region</th>
                <th>1st time [ms]</th>
                <th>avg remaining [ms]</th>
                <th>diff [ms]</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>nodejs14</td>
                <td>europe-west3</td>
                <td>1168</td>
                <td>53</td>
                <td>1115</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>europe-west3</td>
                <td>925</td>
                <td>45</td>
                <td>880</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>europe-west3</td>
                <td>1329</td>
                <td>125</td>
                <td>1204</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>europe-west3</td>
                <td>786</td>
                <td>44</td>
                <td>742</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>europe-west3</td>
                <td>1059</td>
                <td>48</td>
                <td>1011</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>europe-west3</td>
                <td>1093</td>
                <td>78</td>
                <td>1015</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>europe-west3</td>
                <td>1338</td>
                <td>45</td>
                <td>1293</td>
            </tr>
            <tr>
                <td>nodejs14</td>
                <td>us-central1</td>
                <td>1225</td>
                <td>204</td>
                <td>1021</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>us-central1</td>
                <td>1446</td>
                <td>214</td>
                <td>1232</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>us-central1</td>
                <td>1538</td>
                <td>295</td>
                <td>1243</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>us-central1</td>
                <td>1492</td>
                <td>243</td>
                <td>1249</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>us-central1</td>
                <td>1126</td>
                <td>238</td>
                <td>888</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>us-central1</td>
                <td>1331</td>
                <td>330</td>
                <td>1001</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>us-central1</td>
                <td>920</td>
                <td>250</td>
                <td>670</td>
            </tr>
            <tr>
                <td>nodejs14</td>
                <td>asia-east2</td>
                <td>1229</td>
                <td>377</td>
                <td>852</td>
            </tr>
            <tr>
                <td>go113</td>
                <td>asia-east2</td>
                <td>694</td>
                <td>375</td>
                <td>319</td>
            </tr>
            <tr>
                <td>java11</td>
                <td>asia-east2</td>
                <td>1333</td>
                <td>455</td>
                <td>878</td>
            </tr>
            <tr>
                <td>python39</td>
                <td>asia-east2</td>
                <td>1055</td>
                <td>417</td>
                <td>638</td>
            </tr>
            <tr>
                <td>ruby27</td>
                <td>asia-east2</td>
                <td>1002</td>
                <td>411</td>
                <td>591</td>
            </tr>
            <tr>
                <td>dotnet3</td>
                <td>asia-east2</td>
                <td>1433</td>
                <td>477</td>
                <td>956</td>
            </tr>
            <tr>
                <td>php74</td>
                <td>asia-east2</td>
                <td>812</td>
                <td>421</td>
                <td>391</td>
            </tr>
        </tbody>
    </table>
</div>

<script type="text/javascript">
    var activeDataTable;

    function showTable(evt, tabId) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabId).style.display = "block";
        evt.currentTarget.className += " active";

        if (activeDataTable) {
            activeDataTable.destroy();
        }
        const options = {
            searchable: false,
            paging: false,
            info: false
        };
        activeDataTable = new simpleDatatables.DataTable("#" + tabId + "_table", options);
    }

    document.getElementById("defaultOpen").click();
</script>

# Podsumowanie