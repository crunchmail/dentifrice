Dentifrice Templates Design

##Fichiers obligatoires :

* name_template.html
* styles.html
* configuration.json

##Exemple d'Html d'un block de base

	<!-- Munch Block -->
	<tr>
		<td>
			<table cellpadding="0" cellspacing="0" class="munch-block-intro" width="600">
				<tr>
					<td>
						<h2 class="munch-contentEditable">Lorem ipsum<br/> dolor sit amet,<br/> consectetur adipisicing elit. Harum earum, sed distinctio illum</h2>
					</td>
				</tr>
			</table>
		</td>
	</tr>
	<!-- End Munch Block -->

La class .munch-contentEditable sert à rendre le contenu editable via ckEditor.
La class .munch-block-*, qui doit également être présente dans "selector" du fichier configuration.json qui permet le clonage de ce dernier dans le template.

##Exemple de fichier de configuration

	{
		"styles": {
			"Header": {
				"selector": ".munch-block-intro",
	            "icon": "",
				"urlckEditor": "/ckeditor-conf/basic-conf.json"
			}
		}
	}

* **selector** : cible l'element html du DOM pour le cloner via l'interface de gestion des blocks.
* **icon** : html s'affichant lors du choix de l'ajout de block dans le template.
* **urlckEditor** : lien vers la configuration custom de ckEditor.
* **isUnique** : si le block n'est ni supprimable, ni déplaçable.
* **listChangeable** : liste de class css pour changer le fond de l'element.

Pour **listChangeable**, il est important de rajouter la class munch-changeable sur l'element.

Les images peuvent être uploadable en ajoutant la class munch-imageUploadable.
