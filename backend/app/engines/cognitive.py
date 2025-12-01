import random
import json

class CognitiveEngine:
    def generate_abstract_matrix(self, difficulty: int):
        """
        Generates a 3x3 Raven's Matrix puzzle.
        Returns a JSON structure defining the shapes and the rule.
        """
        # Simplified Logic:
        # Rule types: Rotation, Addition, Subtraction
        rules = ["rotation", "progression"]
        rule = random.choice(rules)
        
        matrix = []
        correct_answer = None
        distractors = []
        
        if rule == "rotation":
            # Shape rotates 90 degrees clockwise across the row
            base_shape = random.choice(["square", "triangle", "circle", "star"])
            start_angle = random.choice([0, 45, 90])
            
            for row in range(3):
                row_data = []
                for col in range(3):
                    angle = (start_angle + (col * 90) + (row * 0)) % 360
                    cell = {"shape": base_shape, "angle": angle, "color": "black", "marker": True}
                    row_data.append(cell)
                matrix.append(row_data)
            
            # The missing piece is the last one (2,2)
            correct_answer = matrix[2][2]
            matrix[2][2] = None # Hide it
            
            # Generate unique distractors
            possible_angles = [0, 45, 90, 135, 180, 225, 270, 315]
            # Remove correct angle to avoid duplicates
            if correct_answer["angle"] in possible_angles:
                possible_angles.remove(correct_answer["angle"])
            
            # Shuffle and pick 3 unique angles
            random.shuffle(possible_angles)
            selected_angles = possible_angles[:3]
            
            for angle in selected_angles:
                distractors.append({
                    "shape": base_shape, 
                    "angle": angle, 
                    "color": "black",
                    "marker": True
                })
                
        elif rule == "progression":
            # Number of sides or items increases
            base_count = random.randint(1, 3)
            
            for row in range(3):
                row_data = []
                for col in range(3):
                    count = base_count + col + row
                    cell = {"shape": "dot", "count": count, "color": "blue"}
                    row_data.append(cell)
                matrix.append(row_data)
                
            correct_answer = matrix[2][2]
            matrix[2][2] = None
            
            # Generate unique distractors (different counts)
            correct_count = correct_answer["count"]
            possible_counts = [c for c in range(1, 13) if c != correct_count]
            random.shuffle(possible_counts)
            
            for count in possible_counts[:3]:
                distractors.append({
                    "shape": "dot", 
                    "count": count, 
                    "color": "blue"
                })

        return {
            "type": "abstract",
            "rule": rule,
            "matrix": matrix,
            "options": [correct_answer] + distractors,
            "correct_index": 0 # We shuffle later
        }

    def generate_numerical_series(self, difficulty: int):
        """
        Generates a number series puzzle.
        e.g. 2, 4, 8, 16, ?
        """
        start = random.randint(1, 50)
        step = random.randint(2, 10)
        operator = random.choice(["add", "multiply"])
        
        series = []
        current = start
        for _ in range(5):
            series.append(current)
            if operator == "add":
                current += step
            else:
                current *= step
                
        correct_answer = series[-1]
        series[-1] = "?" # Hide last
        
        # Generate unique distractors
        distractors = set()
        while len(distractors) < 3:
            offset = random.choice([-1, 1]) * random.randint(1, 5)
            # Or sometimes a "logic error" distractor (e.g. step + 1)
            fake_answer = correct_answer + offset
            if fake_answer != correct_answer and fake_answer > 0:
                distractors.add(fake_answer)
        
        return {
            "type": "numerical",
            "series": series,
            "options": [correct_answer] + list(distractors),
            "correct_index": 0
        }

    def generate_verbal_syllogism(self, difficulty: int):
        """
        Generates a syllogism.
        All A are B. Some C are A. Therefore...
        """
        # Templates
        subjects = [
            "Gerentes", "Programadores", "Vendedores", "Líderes", 
            "Diseñadores", "Ingenieros", "Contadores", "Analistas", 
            "Directores", "Consultores", "Arquitectos", "Científicos"
        ]
        # (Plural, Singular) for grammar agreement
        attributes = [
            ("Productivos", "Productivo"), 
            ("Creativos", "Creativo"), 
            ("Analíticos", "Analítico"), 
            ("Estratégicos", "Estratégico"),
            ("Innovadores", "Innovador"),
            ("Eficientes", "Eficiente"),
            ("Organizados", "Organizado"),
            ("Puntuales", "Puntual"),
            ("Responsables", "Responsable"),
            ("Visionarios", "Visionario"),
            ("Pragmáticos", "Pragmático"),
            ("Meticulosos", "Meticuloso")
        ]
        
        s = random.choice(subjects)
        a_pair = random.choice(attributes)
        a_plural = a_pair[0]
        a_singular = a_pair[1]
        
        # Premise 1: All S are A
        p1 = f"Todos los {s} son {a_plural}."
        
        # Premise 2: Some X are S
        x_options = [
            ("Nuevos Empleados", "Nuevo Empleado"),
            ("Becarios", "Becario"),
            ("Candidatos", "Candidato"),
            ("Supervisores", "Supervisor")
        ]
        x_pair = random.choice(x_options)
        x_plural = x_pair[0]
        x_singular = x_pair[1]

        p2 = f"Algunos {x_plural} son {s}."
        
        # Conclusion: Some X are A (Valid)
        conclusion = f"Algunos {x_plural} son {a_plural}."
        
        return {
            "type": "verbal",
            "text": f"{p1} {p2} Por lo tanto...",
            "options": [
                conclusion,
                f"Ningún {x_singular} es {a_singular}.",
                f"Todos los {x_plural} son {a_plural}.",
                "Ninguna de las anteriores."
            ],
            "correct_index": 0
        }
