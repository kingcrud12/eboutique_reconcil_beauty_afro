"""
Exemple simple pour comprendre self et la POO en Python
Exécutez ce fichier pour voir les concepts en action !
"""

# ============================================
# EXEMPLE 1 : Classe simple avec self
# ============================================

class Personne:
    """Classe qui représente une personne"""
    
    def __init__(self, nom, age):
        """
        Constructeur : s'exécute quand on crée une Personne
        self = l'instance créée (la personne spécifique)
        """
        print(f"🔨 Création d'une personne : {nom}")
        self.nom = nom      # self.nom = "mon nom à moi"
        self.age = age      # self.age = "mon âge à moi"
        print(f"   ✅ Personne créée : nom={self.nom}, age={self.age}\n")
    
    def se_presenter(self):
        """
        Méthode : fonction qui appartient à la classe
        self = cette personne spécifique
        """
        print(f"👋 Bonjour ! Je suis {self.nom} et j'ai {self.age} ans")
        print(f"   (self.nom = '{self.nom}', self.age = {self.age})\n")
    
    def feter_anniversaire(self):
        """Augmente l'âge de 1"""
        print(f"🎂 {self.nom} fête son anniversaire !")
        self.age = self.age + 1  # Modifie l'âge de CETTE personne
        print(f"   {self.nom} a maintenant {self.age} ans\n")


# ============================================
# EXEMPLE 2 : Comment self fonctionne
# ============================================

print("=" * 60)
print("EXEMPLE 1 : Création de deux personnes différentes")
print("=" * 60)

# Création de deux instances différentes
alice = Personne("Alice", 25)
bob = Personne("Bob", 30)

print("=" * 60)
print("Appel de se_presenter() sur chaque instance")
print("=" * 60)

# Quand on appelle alice.se_presenter(), self = alice
alice.se_presenter()

# Quand on appelle bob.se_presenter(), self = bob
bob.se_presenter()

print("=" * 60)
print("Modification de l'âge d'Alice uniquement")
print("=" * 60)

# Seule Alice fête son anniversaire
alice.feter_anniversaire()

# Vérification : Bob n'a pas changé
print(f"Alice a maintenant {alice.age} ans")
print(f"Bob a toujours {bob.age} ans\n")


# ============================================
# EXEMPLE 3 : Simuler BaseTest de manière simple
# ============================================

class TestSimple:
    """Version simplifiée de BaseTest pour comprendre"""
    
    def __init__(self, nom_test, message_succes):
        """
        Constructeur
        self = cette instance de test
        """
        print(f"🔨 Création du test : {nom_test}")
        self.nom_test = nom_test
        self.message_succes = message_succes
        self.resultat = None  # Pas encore de résultat
        print(f"   ✅ Test '{self.nom_test}' créé\n")
    
    def executer(self, reussit=True):
        """
        Simule l'exécution du test
        self = cette instance de test
        """
        print(f"▶️  Exécution du test '{self.nom_test}'")
        self.resultat = reussit
        
        if self.resultat:
            print(f"   ✅ {self.message_succes}")
        else:
            print(f"   ❌ Le test '{self.nom_test}' a échoué")
        print()
    
    def afficher_resultat(self):
        """Affiche le résultat du test"""
        if self.resultat is None:
            print(f"⚠️  Le test '{self.nom_test}' n'a pas encore été exécuté")
        elif self.resultat:
            print(f"✅ Test '{self.nom_test}' : RÉUSSI")
        else:
            print(f"❌ Test '{self.nom_test}' : ÉCHOUÉ")
        print()


print("=" * 60)
print("EXEMPLE 2 : Simuler BaseTest")
print("=" * 60)

# Création de deux tests différents
test1 = TestSimple("Test d'inscription", "Inscription réussie !")
test2 = TestSimple("Test de connexion", "Connexion réussie !")

# Exécution des tests
test1.executer(reussit=True)
test2.executer(reussit=False)

# Affichage des résultats
test1.afficher_resultat()
test2.afficher_resultat()


# ============================================
# EXEMPLE 4 : Visualiser self
# ============================================

class DemoSelf:
    """Pour visualiser ce qu'est self"""
    
    def __init__(self, identifiant):
        self.identifiant = identifiant
        print(f"🔨 Création de l'objet avec identifiant : {identifiant}")
        print(f"   Dans __init__, self = {id(self)} (adresse mémoire)")
        print(f"   self.identifiant = {self.identifiant}\n")
    
    def montrer_self(self):
        """Montre ce qu'est self"""
        print(f"📌 Dans montrer_self() :")
        print(f"   self = {id(self)} (adresse mémoire)")
        print(f"   self.identifiant = {self.identifiant}")
        print(f"   C'est le MÊME objet que celui créé !\n")


print("=" * 60)
print("EXEMPLE 3 : Visualiser self")
print("=" * 60)

objet1 = DemoSelf("OBJET-1")
objet2 = DemoSelf("OBJET-2")

print("Appel de montrer_self() sur objet1 :")
objet1.montrer_self()

print("Appel de montrer_self() sur objet2 :")
objet2.montrer_self()

print("=" * 60)
print("CONCLUSION")
print("=" * 60)
print("""
✅ self = référence à l'instance (l'objet créé)
✅ self.attribut = accéder à un attribut de cette instance
✅ Chaque instance a ses propres valeurs
✅ Quand on appelle objet.methode(), self = objet

Dans BaseTest :
- test1 = BaseTest(...) → self = test1 dans toutes les méthodes
- test2 = BaseTest(...) → self = test2 dans toutes les méthodes
- Chaque test a ses propres valeurs (messages, driver, etc.)
""")

