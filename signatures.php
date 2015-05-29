<?php

class signatures {
	function delete($ids) {
		global $mysql, $maskID, $userID, $refresh;

		foreach ($ids AS $id) {
			$query = 'UPDATE signatures SET userID = :userID WHERE id = :id AND mask = :mask';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':id', $id, PDO::PARAM_INT);
			$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
			$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
			$success = @$stmt->execute();

			$query = 'DELETE FROM signatures WHERE id = :id AND mask = :mask';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':id', $id, PDO::PARAM_INT);
			$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
			$success = @$stmt->execute();

			if ($success)
				$refresh['sigUpdate'] = $refresh['chainUpdate'] = true;
		}

		return $success;
	}

	function rename($sigs) {
		global $mysql, $maskID, $userID, $refresh;
		$sigs = is_array($sigs) ? $sigs : array($sigs);

		foreach ($sigs AS $sig) {
			$id = $sig->id;
			$name = $sig->name;

			if ($sig->side == 'parent') {
				$query = 'UPDATE signatures SET system = :name, userID = :userID, time = NOW() WHERE id = :id AND mask = :mask';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':id', $id, PDO::PARAM_INT);
				$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
				$stmt->bindValue(':name', $name, PDO::PARAM_STR);
				$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
				$success = @$stmt->execute();

				if ($success)
					$refresh['sigUpdate'] = $refresh['chainUpdate'] = true;
			} else {
				$query = 'UPDATE signatures SET connection = :name, userID = :userID, time = NOW() WHERE id = :id AND mask = :mask';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':id', $id, PDO::PARAM_INT);
				$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
				$stmt->bindValue(':name', $name, PDO::PARAM_STR);
				$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
				$success = @$stmt->execute();

				if ($success)
					$refresh['sigUpdate'] = $refresh['chainUpdate'] = true;
			}
		}

		return $success;
	}

	function add($sigs) {
		global $mysql, $maskID, $userID, $refresh;
		$sigs = is_array($sigs) ? $sigs : array($sigs);

		foreach ($sigs AS $sig) {
			$systemID			= $sig->systemID;
			$systemName			= property_exists($sig, 'systemName') ? $sig->systemName : null;
			$signatureID 		= strtoupper($sig->id);
			$signatureType 		= $sig->type;

			if ($signatureType == 'Wormhole') {
				$whType				= property_exists($sig, 'whType') ? strtoupper($sig->whType) : '???';
				$whLife				= property_exists($sig, 'whLife') ? $sig->whLife : 'Stable';
				$whMass				= property_exists($sig, 'whMass') ? $sig->whMass : 'Stable';
				$connectionID		= property_exists($sig, 'connectionID') ? $sig->connectionID : null;
				$connectionName		= property_exists($sig, 'connectionName') ? $sig->connectionName : null;
				$sig2ID				= '???';
				$sig2Type			= $whType !== 'K162' ? 'K162' : '???';
				$lifeLength			= $whLife == 'Critical' ? 4 : (property_exists($sig, 'lifeLength') ? $sig->lifeLength : 24);
				$class 				= property_exists($sig, 'class') ? $sig->class : null;
				$class2				= property_exists($sig, 'class2') ? $sig->class2 : null;
				$letters			= range('a', 'z');
				
				// BM stuff
				if ($whType !== '???') {
					//$query = 'SELECT typeBM FROM signatures WHERE (systemID = :systemID AND type = :type AND mask = :mask) OR (connectionID = :systemID AND sig2Type = :type AND mask = :mask)';
					$query = 'SELECT typeBM FROM signatures WHERE systemID = :systemID AND type = :type AND mask = :mask UNION SELECT type2BM AS typeBM FROM signatures WHERE connectionID = :systemID AND sig2Type = :type AND mask = :mask';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
					$stmt->bindValue(':type', $whType, PDO::PARAM_STR);
					$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
					$stmt->execute();

					$typeBM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
				} else {
					$typeBM = array(null);
				}

				if ($sig2Type !== '???') {
					//$query = 'SELECT type2BM FROM signatures WHERE (systemID = :connectionID AND type = :sig2Type AND mask = :mask) OR (connectionID = :connectionID AND sig2Type = :sig2Type AND mask = :mask)';
					$query = 'SELECT typeBM FROM signatures WHERE systemID = :connectionID AND type = :sig2Type AND mask = :mask UNION SELECT type2BM AS typeBM FROM signatures WHERE connectionID = :connectionID AND sig2Type = :sig2Type AND mask = :mask';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':connectionID', $connectionID, PDO::PARAM_INT);
					$stmt->bindValue(':sig2Type', $sig2Type, PDO::PARAM_STR);
					$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
					$stmt->execute();

					$type2BM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
				} else {
					$type2BM = array(null);
				}

				if ($class) {
					//$query = 'SELECT classBM FROM signatures WHERE (systemID = :systemID AND class = :class AND mask = :mask) OR (connectionID = :systemID AND class2 = :class AND mask = :mask)';
					$query = 'SELECT classBM FROM signatures WHERE systemID = :systemID AND class = :class AND mask = :mask UNION SELECT class2BM AS classBM FROM signatures WHERE connectionID = :systemID AND class2 = :class AND mask = :mask';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
					$stmt->bindValue(':class', $class, PDO::PARAM_STR);
					$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
					$stmt->execute();

					$classBM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
				} else {
					$classBM = array(null);
				}

				if ($class2) {
					$query = 'SELECT class2BM FROM signatures WHERE (systemID = :connectionID AND class = :class2 AND mask = :mask) OR (connectionID = :connectionID AND class2 = :class2 AND mask = :mask)';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':connectionID', $connectionID, PDO::PARAM_INT);
					$stmt->bindValue(':class2', $class2, PDO::PARAM_STR);
					$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
					$stmt->execute();

					$class2BM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
				} else {
					$class2BM = array(null);
				}

				$query = 'INSERT INTO signatures (signatureID, system, systemID, type, typeBM, sig2ID, sig2Type, type2BM, connection, connectionID, life, lifeTime, lifeLeft, lifeLength, mass, mask, time, class, class2, classBM, class2BM, userID)
							VALUES (:signatureID, :system, :systemID, :type, :typeBM, :sig2ID, :sig2Type, :type2BM, :connection, :connectionID, :life, NOW(), DATE_ADD(NOW(), INTERVAL :lifeLength HOUR), :lifeLength, :mass, :mask, NOW(), :class, :class2, :classBM, :class2BM, :userID)';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':signatureID', $signatureID, PDO::PARAM_STR);
				$stmt->bindValue(':system', $systemName, PDO::PARAM_STR);
				$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
				$stmt->bindValue(':type', $whType, PDO::PARAM_STR);
				$stmt->bindValue(':class', $class, PDO::PARAM_STR);
				$stmt->bindValue(':classBM', $classBM[0], PDO::PARAM_STR);
				$stmt->bindValue(':typeBM', $typeBM[0], PDO::PARAM_STR);
				$stmt->bindValue(':sig2ID', $sig2ID, PDO::PARAM_STR);
				$stmt->bindValue(':connection', $connectionName, PDO::PARAM_STR);
				$stmt->bindValue(':connectionID', $connectionID, PDO::PARAM_INT);
				$stmt->bindValue(':sig2Type', $sig2Type, PDO::PARAM_STR);
				$stmt->bindValue(':class2', $class2, PDO::PARAM_STR);
				$stmt->bindValue(':class2BM', $class2BM[0], PDO::PARAM_STR);
				$stmt->bindValue(':type2BM', $type2BM[0], PDO::PARAM_STR);
				$stmt->bindValue(':life', $whLife, PDO::PARAM_STR);
				$stmt->bindValue(':lifeLength', $lifeLength, PDO::PARAM_STR);
				$stmt->bindValue(':mass', $whMass, PDO::PARAM_STR);
				$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
				$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
				$success = $stmt->execute();

				if ($success)
					$refresh['chainUpdate'] = true;
			} else {
				$signatureLife 		= property_exists($sig, 'life') ? $sig->life : 24;
				$signatureName 		= $sig->name;

				$query = 'INSERT INTO signatures (signatureID, system, systemID, type, lifeTime, lifeLeft, lifeLength, name, mask, time, userID)
							VALUES (:signatureID, :system, :systemID, :type, NOW(), DATE_ADD(NOW(), INTERVAL :lifeLength HOUR), :lifeLength, :name, :mask, NOW(), :userID)';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':signatureID', $signatureID, PDO::PARAM_STR);
				$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
				$stmt->bindValue(':system', $systemName, PDO::PARAM_STR);
				$stmt->bindValue(':type', $signatureType, PDO::PARAM_STR);
				$stmt->bindValue(':name', $signatureName, PDO::PARAM_STR);
				$stmt->bindValue(':lifeLength', $signatureLife, PDO::PARAM_STR);
				$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
				$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
				$success = $stmt->execute();
			}

			if ($success)
				$refresh['sigUpdate'] = true;
		}

		$count = count($sigs);
		$query = "UPDATE userStats SET sigCount = sigCount + $count WHERE userID = :userID";
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
		$stmt->execute();

		return $success;
	}

	function update($sigs) {
		global $mysql, $maskID, $refresh, $userID;
		$sigs = is_array($sigs) ? $sigs : array($sigs);

		foreach ($sigs AS $sig) {
			$id 				= $sig->id;
			$systemID			= $sig->systemID;
			$systemName			= property_exists($sig, 'systemName') ? $sig->systemName : null;
			$signatureID 		= strtoupper($sig->sigID);
			$signatureType 		= $sig->type;
			$name = $editing = null;

			if ($signatureType == 'Wormhole') {
				$query = 'SELECT * FROM signatures WHERE id = :id AND mask = :mask';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':id', $id, PDO::PARAM_INT);
				$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
				$stmt->execute();
				$old = $stmt->fetch(PDO::FETCH_OBJ);

				$whType				= property_exists($sig, 'whType') ? strtoupper($sig->whType) : '???';
				$whLife				= $sig->whLife;
				$whMass				= $sig->whMass;
				$lifeLength			= $whLife == 'Critical' ? 4 : $sig->lifeLength;
				$connectionID		= property_exists($sig, 'connectionID') ? $sig->connectionID : $old->connectionID;
				$connectionName		= $sig->connectionName;
				$sig2ID				= $sig->sig2ID ? $sig->sig2ID : '???';
				$sig2Type			= $whType !== 'K162' ? 'K162' : ($sig->sig2Type !== 'K162' ? $sig->sig2Type : '???');
				$class 				= property_exists($sig, 'class') ? $sig->class : null;
				$class2				= property_exists($sig, 'class2') ? $sig->class2 : null;
				$typeBM 			= Array($old->typeBM);
				$type2BM 			= Array($old->type2BM);
				$classBM 			= Array($old->classBM);
				$class2BM 			= Array($old->class2BM);
				$letters			= range('a', 'z');

				if ($sig->side == 'parent') {
					if ($whType != $old->type && $whType !== '???') {
						//$query = 'SELECT typeBM FROM signatures WHERE (systemID = :systemID AND type = :type AND mask = :mask) OR (connectionID = :systemID AND sig2Type = :type AND mask = :mask)';
						$query = 'SELECT typeBM FROM signatures WHERE systemID = :systemID AND type = :type AND mask = :mask UNION SELECT type2BM AS typeBM FROM signatures WHERE connectionID = :systemID AND sig2Type = :type AND mask = :mask';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
						$stmt->bindValue(':type', $whType, PDO::PARAM_STR);
						$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
						$stmt->execute();

						$typeBM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
					}

					if ($sig2Type != $old->sig2Type && $sig2Type !== '???') {
						//$query = 'SELECT type2BM FROM signatures WHERE (systemID = :connectionID AND type = :sig2Type AND mask = :mask) OR (connectionID = :connectionID AND sig2Type = :sig2Type AND mask = :mask)';
						$query = 'SELECT typeBM FROM signatures WHERE systemID = :connectionID AND type = :sig2Type AND mask = :mask UNION SELECT type2BM AS typeBM FROM signatures WHERE connectionID = :connectionID AND sig2Type = :sig2Type AND mask = :mask';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':connectionID', $connectionID, PDO::PARAM_INT);
						$stmt->bindValue(':sig2Type', $sig2Type, PDO::PARAM_STR);
						$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
						$stmt->execute();

						$type2BM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
					}

					if ($class && $class != $old->class) {
						//$query = 'SELECT classBM FROM signatures WHERE (systemID = :systemID AND class = :class AND mask = :mask) OR (connectionID = :systemID AND class2 = :class AND mask = :mask)';
						$query = 'SELECT classBM FROM signatures WHERE systemID = :systemID AND class = :class AND mask = :mask UNION SELECT class2BM AS classBM FROM signatures WHERE connectionID = :systemID AND class2 = :class AND mask = :mask';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
						$stmt->bindValue(':class', $class, PDO::PARAM_STR);
						$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
						$stmt->execute();

						$classBM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
					}

					if ($class2 && $class2 != $old->class2) {
						$query = 'SELECT class2BM FROM signatures WHERE (systemID = :connectionID AND class = :class2 AND mask = :mask) OR (connectionID = :connectionID AND class2 = :class2 AND mask = :mask)';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':connectionID', $connectionID, PDO::PARAM_INT);
						$stmt->bindValue(':class2', $class2, PDO::PARAM_STR);
						$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
						$stmt->execute();

						$class2BM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
					}

					if ($whLife) {
						if ($whLife == 'Critical') {
							$lifeStatement = 'life = :life, lifeLeft = DATE_ADD(NOW(), INTERVAL :lifeLength HOUR)';
						} else {
							$lifeStatement = 'life = :life, lifeLeft = DATE_ADD(NOW(), INTERVAL :lifeLength HOUR), lifeTime = NOW()';
						}
					} else {
						$lifeStatement = 'lifeLeft = DATE_ADD(lifeTime, INTERVAL :lifeLength HOUR)';
					}

					$query = "UPDATE signatures
								SET signatureID = :signatureID, type = :type, sig2ID = :sig2ID, sig2Type = :sig2Type, connection = :connection, typeBM = :typeBM,
								type2BM = :type2BM, connectionID = :connectionID, mass = :mass, name = :name, lifeLength = :lifeLength, time = NOW(),
								class = :class, class2 = :class2, classBM = :classBM, class2BM = :class2BM, userID = :userID, $lifeStatement
								WHERE id = :id";
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':signatureID', $signatureID, PDO::PARAM_STR);
					$stmt->bindValue(':type', $whType, PDO::PARAM_STR);
					$stmt->bindValue(':class', $class, PDO::PARAM_STR);
					$stmt->bindValue(':classBM', $classBM[0], PDO::PARAM_STR);
					$stmt->bindValue(':typeBM', $typeBM[0], PDO::PARAM_STR);
					$stmt->bindValue(':sig2ID', $sig2ID, PDO::PARAM_STR);
					$stmt->bindValue(':sig2Type', $sig2Type, PDO::PARAM_STR);
					$stmt->bindValue(':class2', $class2, PDO::PARAM_STR);
					$stmt->bindValue(':class2BM', $class2BM[0], PDO::PARAM_STR);
					$stmt->bindValue(':connection', $connectionName, PDO::PARAM_STR);
					$stmt->bindValue(':connectionID', $connectionID, PDO::PARAM_INT);
					$stmt->bindValue(':type2BM', $type2BM[0], PDO::PARAM_STR);
					$stmt->bindValue(':mass', $whMass, PDO::PARAM_STR);
					$stmt->bindValue(':name', $name, PDO::PARAM_STR);
					$stmt->bindValue(':life', $whLife, PDO::PARAM_STR);
					$stmt->bindValue(':lifeLength', $lifeLength, PDO::PARAM_STR);
					$stmt->bindValue(':id', $id, PDO::PARAM_INT);
					$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
					$success = $stmt->execute();
				} else {
					if ($sig2Type != $old->type && $sig2Type !== '???') {
						//$query = 'SELECT typeBM FROM signatures WHERE (systemID = :systemID AND type = :type AND mask = :mask) OR (connectionID = :systemID AND sig2Type = :type AND mask = :mask)';
						$query = 'SELECT typeBM FROM signatures WHERE systemID = :systemID AND type = :type AND mask = :mask UNION SELECT type2BM AS typeBM FROM signatures WHERE connectionID = :systemID AND sig2Type = :type AND mask = :mask';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
						$stmt->bindValue(':type', $sig2Type, PDO::PARAM_STR);
						$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
						$stmt->execute();

						$typeBM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
					}

					if ($whType != $old->sig2Type && $whType !== '???') {
						//$query = 'SELECT type2BM FROM signatures WHERE (systemID = :connectionID AND type = :sig2Type AND mask = :mask) OR (connectionID = :connectionID AND sig2Type = :sig2Type AND mask = :mask)';
						$query = 'SELECT typeBM FROM signatures WHERE systemID = :connectionID AND type = :sig2Type AND mask = :mask UNION SELECT type2BM AS typeBM FROM signatures WHERE connectionID = :connectionID AND sig2Type = :sig2Type AND mask = :mask';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':connectionID', $connectionID, PDO::PARAM_INT);
						$stmt->bindValue(':sig2Type', $whType, PDO::PARAM_STR);
						$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
						$stmt->execute();

						$type2BM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
					}

					if ($class2 && $class2 != $old->class) {
						//$query = 'SELECT classBM FROM signatures WHERE (systemID = :systemID AND class = :class AND mask = :mask) OR (connectionID = :systemID AND class2 = :class AND mask = :mask)';
						$query = 'SELECT classBM FROM signatures WHERE systemID = :systemID AND class = :class AND mask = :mask UNION SELECT class2BM AS classBM FROM signatures WHERE connectionID = :systemID AND class2 = :class AND mask = :mask';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
						$stmt->bindValue(':class', $class2, PDO::PARAM_STR);
						$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
						$stmt->execute();

						$classBM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
					}

					if ($class && $class != $old->class2) {
						$query = 'SELECT class2BM FROM signatures WHERE (systemID = :connectionID AND class = :class2 AND mask = :mask) OR (connectionID = :connectionID AND class2 = :class2 AND mask = :mask)';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':connectionID', $connectionID, PDO::PARAM_INT);
						$stmt->bindValue(':class2', $class, PDO::PARAM_STR);
						$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
						$stmt->execute();

						$class2BM = array_values(array_diff($letters, $stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
					}

					if ($whLife) {
						if ($whLife == 'Critical') {
							$lifeStatement = 'life = :life, lifeLeft = DATE_ADD(NOW(), INTERVAL :lifeLength HOUR)';
						} else {
							$lifeStatement = 'life = :life, lifeLeft = DATE_ADD(NOW(), INTERVAL :lifeLength HOUR), lifeTime = NOW()';
						}
					} else {
						$lifeStatement = 'lifeLeft = DATE_ADD(lifeTime, INTERVAL :lifeLength HOUR)';
					}

					$query = "UPDATE signatures
								SET signatureID = :signatureID, type = :type, sig2ID = :sig2ID, sig2Type = :sig2Type, system = :system, typeBM = :typeBM,
								type2BM = :type2BM, systemID = :systemID, mass = :mass, name = :name, lifeLength = :lifeLength, time = NOW(),
								class = :class, class2 = :class2, classBM = :classBM, class2BM = :class2BM, userID = :userID, $lifeStatement
								WHERE id = :id";
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':signatureID', $sig2ID, PDO::PARAM_STR);
					$stmt->bindValue(':type', $sig2Type, PDO::PARAM_STR);
					$stmt->bindValue(':class', $class2, PDO::PARAM_STR);
					$stmt->bindValue(':classBM', $classBM[0], PDO::PARAM_STR);
					$stmt->bindValue(':typeBM', $typeBM[0], PDO::PARAM_STR);
					$stmt->bindValue(':sig2ID', $signatureID, PDO::PARAM_STR);
					$stmt->bindValue(':sig2Type', $whType, PDO::PARAM_STR);
					$stmt->bindValue(':class2', $class, PDO::PARAM_STR);
					$stmt->bindValue(':class2BM', $class2BM[0], PDO::PARAM_STR);
					$stmt->bindValue(':system', $connectionName, PDO::PARAM_STR);
					$stmt->bindValue(':systemID', $connectionID, PDO::PARAM_INT);
					$stmt->bindValue(':type2BM', $type2BM[0], PDO::PARAM_STR);
					$stmt->bindValue(':mass', $whMass, PDO::PARAM_STR);
					$stmt->bindValue(':name', $name, PDO::PARAM_STR);
					$stmt->bindValue(':life', $whLife, PDO::PARAM_STR);
					$stmt->bindValue(':lifeLength', $lifeLength, PDO::PARAM_STR);
					$stmt->bindValue(':id', $id, PDO::PARAM_INT);
					$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
					$success = $stmt->execute();
				}

				if ($success)
					$refresh['chainUpdate'] = true;

				// Update life
				/*
				if ($whLife) {
					if ($whLife == 'Critical') {
						$query = 'UPDATE signatures SET life = :life, lifeLeft = DATE_ADD(NOW(), INTERVAL 4 HOUR) WHERE id = :id AND mask = :mask';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':id', $id, PDO::PARAM_INT);
						$stmt->bindValue(':life', $whLife, PDO::PARAM_STR);
						$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
						$stmt->execute();
					} else {
						$query = 'UPDATE signatures SET life = :life, lifeTime = NOW(), lifeLeft = DATE_ADD(NOW(), INTERVAL :lifeLength HOUR) WHERE id = :id AND mask = :mask';
						$stmt = $mysql->prepare($query);
						$stmt->bindValue(':id', $id, PDO::PARAM_INT);
						$stmt->bindValue(':life', $whLife, PDO::PARAM_STR);
						$stmt->bindValue(':lifeLength', $lifeLength, PDO::PARAM_STR);
						$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
						$stmt->execute();
					}
				} else {
					// This just updates lifeLeft - this should be done every time
					$query = 'UPDATE signatures SET lifeLeft = DATE_ADD(lifeTime, INTERVAL :lifeLength HOUR) WHERE id = :id AND life != "Critical" AND mask = :mask';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':id', $id, PDO::PARAM_INT);
					$stmt->bindValue(':lifeLength', $lifeLength, PDO::PARAM_STR);
					$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
					$stmt->execute();
				}
				*/
			} else {
				$signatureLife 		= $sig->life;
				$signatureName 		= $sig->name;
				$typeBM = $type2BM = $sig2ID = $connectionName = $connectionID = $sig2Type = $whLife = $whMass = $editing = null;

				$query = 'UPDATE signatures
							SET signatureID = :signatureID, system = :system, systemID = :systemID, type = :type, sig2ID = :sig2ID, sig2Type = :sig2Type, 
							connection = :connection, connectionID = :connectionID, life = :life, mass = :mass, name = :name, mask = :mask,
							lifeLength = :lifeLength, lifeLeft = DATE_ADD(lifeTime, INTERVAL :lifeLength HOUR), time = NOW(), userID = :userID
							WHERE id = :id';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':signatureID', $signatureID, PDO::PARAM_INT);
				$stmt->bindValue(':system', $systemName, PDO::PARAM_STR);
				$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
				$stmt->bindValue(':type', $signatureType, PDO::PARAM_STR);
				$stmt->bindValue(':sig2ID', $sig2ID, PDO::PARAM_STR);
				$stmt->bindValue(':sig2Type', $sig2Type, PDO::PARAM_STR);
				$stmt->bindValue(':connection', $connectionName, PDO::PARAM_STR);
				$stmt->bindValue(':connectionID', $connectionID, PDO::PARAM_INT);
				$stmt->bindValue(':life', $whLife, PDO::PARAM_STR);
				$stmt->bindValue(':mass', $whMass, PDO::PARAM_STR);
				$stmt->bindValue(':name', $signatureName, PDO::PARAM_STR);
				$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
				$stmt->bindValue(':lifeLength', $signatureLife, PDO::PARAM_STR);
				$stmt->bindValue(':id', $id, PDO::PARAM_INT);
				$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
				$success = $stmt->execute();
			}

			if ($success)
				$refresh['sigUpdate'] = true;
		}

		return $success;
	}
}

?>